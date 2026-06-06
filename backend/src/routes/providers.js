const router = require('express').Router()
const pool = require('../db/pool')
const { authAdmin } = require('../middleware/auth')

async function notifyAdmins(providerId, p) {
  const token = process.env.BOT_TOKEN
  const adminIds = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean)
  if (!token || !adminIds.length) return

  const text =
    `🏢 <b>Новый бизнес — Кабарман</b>\n\n` +
    `📁 ${p.category} · 📍 ${p.district}\n` +
    `🏷️ ${p.name}\n` +
    `📞 ${p.phone}\n` +
    (p.description ? `📝 ${p.description}\n` : '') +
    (p.address     ? `🏠 ${p.address}\n`     : '') +
    (p.social_link ? `🔗 ${p.social_link}\n` : '') +
    (p.tg_username ? `✈️ @${p.tg_username}\n` : '') +
    `\nID: ${providerId}`

  const keyboard = {
    inline_keyboard: [[
      { text: '❌ Удалить', callback_data: `del_provider:${providerId}` }
    ]]
  }

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

// GET /api/providers — каталог с фильтрами
router.get('/', async (req, res) => {
  try {
    const { category, district, q, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conditions = ['p.is_active = true', 'p.is_approved = true']

    if (category) {
      params.push(category)
      conditions.push(`c.name = $${params.length}`)
    }
    if (district) {
      params.push(district)
      conditions.push(`d.name = $${params.length}`)
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`)
      conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`)
    }

    const where = conditions.join(' AND ')
    params.push(limit, offset)

    const result = await pool.query(`
      SELECT p.id, p.name, p.phone, p.description, p.address, p.social_link,
             p.tg_username, p.created_at,
             c.name AS category, c.emoji,
             d.name AS district
      FROM providers p
      JOIN categories c ON p.category_id = c.id
      JOIN districts d ON p.district_id = d.id
      WHERE ${where}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params)

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM providers p
      JOIN categories c ON p.category_id = c.id
      JOIN districts d ON p.district_id = d.id
      WHERE ${where}
    `, params.slice(0, -2))

    res.json({
      providers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/providers — регистрация с сайта
router.post('/', async (req, res) => {
  try {
    const { name, phone, category, district, description, address, social_link, tg_username } = req.body
    if (!name || !phone || !category || !district) {
      return res.status(400).json({ error: 'Заполните обязательные поля' })
    }

    const catQ = await pool.query('SELECT id FROM categories WHERE name = $1', [category])
    const distQ = await pool.query('SELECT id FROM districts WHERE name = $1', [district])
    if (!catQ.rows.length || !distQ.rows.length) {
      return res.status(400).json({ error: 'Неверная категория или район' })
    }

    // Обрабатываем Instagram никнейм → ссылка
    let socialUrl = social_link || null
    if (socialUrl && socialUrl.startsWith('@')) {
      socialUrl = `https://instagram.com/${socialUrl.slice(1)}`
    } else if (socialUrl && !socialUrl.startsWith('http')) {
      socialUrl = `https://instagram.com/${socialUrl}`
    }

    const ins = await pool.query(`
      INSERT INTO providers (tg_id, name, phone, category_id, district_id, description, address, social_link, tg_username, is_active, is_approved)
      VALUES (0,$1,$2,$3,$4,$5,$6,$7,$8, true, true)
      RETURNING id
    `, [name, phone, catQ.rows[0].id, distQ.rows[0].id, description, address, socialUrl, tg_username])

    const providerId = ins.rows[0].id
    await notifyAdmins(providerId, { name, phone, category, district, description, address, social_link: socialUrl, tg_username })

    res.status(201).json({ message: 'Ваш бизнес добавлен в каталог!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// PATCH /api/providers/:id/approve — одобрить (admin)
router.patch('/:id/approve', authAdmin, async (req, res) => {
  await pool.query('UPDATE providers SET is_approved=true WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

// PATCH /api/providers/:id/reject — отклонить (admin)
router.patch('/:id/reject', authAdmin, async (req, res) => {
  await pool.query('UPDATE providers SET is_active=false WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

// DELETE /api/providers/:id — удалить (admin)
router.delete('/:id', authAdmin, async (req, res) => {
  await pool.query('UPDATE providers SET is_active=false WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

module.exports = router
