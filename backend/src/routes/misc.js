const router = require('express').Router()
const pool = require('../db/pool')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authAdmin } = require('../middleware/auth')

// GET /api/categories
router.get('/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories WHERE is_active=true ORDER BY sort_order')
  res.json(result.rows)
})

// GET /api/oblasts
router.get('/oblasts', async (req, res) => {
  const result = await pool.query('SELECT * FROM oblasts WHERE is_active=true ORDER BY sort_order')
  res.json(result.rows)
})

// GET /api/districts?oblast_id=X
router.get('/districts', async (req, res) => {
  const { oblast_id } = req.query
  if (oblast_id) {
    const result = await pool.query(
      'SELECT * FROM districts WHERE is_active=true AND oblast_id=$1 ORDER BY sort_order',
      [parseInt(oblast_id)]
    )
    res.json(result.rows)
  } else {
    const result = await pool.query('SELECT * FROM districts WHERE is_active=true ORDER BY sort_order')
    res.json(result.rows)
  }
})

// POST /api/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const adminUser = process.env.ADMIN_USERNAME || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || 'kabarman2025'

    if (username !== adminUser || password !== adminPass) {
      return res.status(401).json({ error: 'Неверный логин или пароль' })
    }

    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/admin/stats
router.get('/admin/stats', authAdmin, async (req, res) => {
  const [active, pending, clients, searches] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM providers WHERE is_approved=true AND is_active=true'),
    pool.query('SELECT COUNT(*) FROM providers WHERE is_approved=false AND is_active=true'),
    pool.query('SELECT COUNT(*) FROM clients'),
    pool.query('SELECT COUNT(*) FROM searches')
  ])
  const byDistrict = await pool.query(`
    SELECT d.name, COUNT(p.id) AS cnt
    FROM districts d
    LEFT JOIN providers p ON p.district_id=d.id AND p.is_approved=true AND p.is_active=true
    GROUP BY d.id, d.name ORDER BY d.sort_order
  `)
  res.json({
    active: parseInt(active.rows[0].count),
    pending: parseInt(pending.rows[0].count),
    clients: parseInt(clients.rows[0].count),
    searches: parseInt(searches.rows[0].count),
    by_district: byDistrict.rows
  })
})

// GET /api/admin/pending
router.get('/admin/pending', authAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, c.name AS category, c.emoji, d.name AS district
    FROM providers p
    JOIN categories c ON p.category_id=c.id
    JOIN districts d ON p.district_id=d.id
    WHERE p.is_approved=false AND p.is_active=true
    ORDER BY p.created_at DESC
  `)
  res.json(result.rows)
})

// POST /api/report — жалоба на объявление или бизнес
router.post('/report', async (req, res) => {
  const { type, id } = req.body
  if (!type || !id) return res.status(400).json({ error: 'Укажите type и id' })

  const token    = process.env.BOT_TOKEN
  const adminIds = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

  if (token && adminIds.length) {
    let text = ''
    const keyboard = {
      inline_keyboard: [[
        { text: '❌ Удалить', callback_data: `del_${type}:${id}` }
      ]]
    }

    try {
      if (type === 'listing') {
        const r = await pool.query(
          `SELECT l.title, l.category, l.price, l.is_negotiable, l.contact_phone,
                  l.description, d.name AS district
           FROM listings l
           LEFT JOIN districts d ON l.district_id = d.id
           WHERE l.id = $1`, [id]
        )
        const l = r.rows[0]
        if (l) {
          const price = l.is_negotiable ? 'Договорная' : l.price ? `${l.price} сом` : 'Бесплатно'
          text =
            `🚩 <b>Жалоба на объявление #${id}</b>\n\n` +
            `📌 ${l.title}\n` +
            `🏷 ${l.category} · 💰 ${price}\n` +
            (l.district ? `📍 ${l.district}\n` : '') +
            (l.description ? `📝 ${l.description.slice(0, 100)}\n` : '') +
            `📞 ${l.contact_phone}`
        }
      } else {
        const r = await pool.query(
          `SELECT p.name, p.phone, p.description, p.address,
                  c.name AS category, d.name AS district
           FROM providers p
           JOIN categories c ON p.category_id = c.id
           JOIN districts d ON p.district_id = d.id
           WHERE p.id = $1`, [id]
        )
        const p = r.rows[0]
        if (p) {
          text =
            `🚩 <b>Жалоба на бизнес #${id}</b>\n\n` +
            `🏷️ ${p.name}\n` +
            `📁 ${p.category} · 📍 ${p.district}\n` +
            (p.description ? `📝 ${p.description.slice(0, 100)}\n` : '') +
            (p.address ? `🏠 ${p.address}\n` : '') +
            `📞 ${p.phone}`
        }
      }
    } catch (_) {}

    if (!text) text = `🚩 <b>Жалоба на ${type === 'listing' ? 'объявление' : 'бизнес'} #${id}</b>`

    for (const chatId of adminIds) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard })
        })
      } catch (_) {}
    }
  }
  res.json({ ok: true })
})

module.exports = router
