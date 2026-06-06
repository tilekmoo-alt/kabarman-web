const router = require('express').Router()
const pool = require('../db/pool')
const multer = require('multer')
const sharp = require('sharp')
const { uploadToR2 } = require('../utils/r2')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Только изображения'))
  }
})

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const { category, oblast_id, district_id, q, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conditions = ['l.is_active = true', 'l.expires_at > NOW()']

    if (category) { params.push(category); conditions.push(`l.category = $${params.length}`) }
    if (oblast_id) { params.push(parseInt(oblast_id)); conditions.push(`l.oblast_id = $${params.length}`) }
    if (district_id) { params.push(parseInt(district_id)); conditions.push(`l.district_id = $${params.length}`) }
    if (q) {
      params.push(`%${q.toLowerCase()}%`)
      conditions.push(`(LOWER(l.title) LIKE $${params.length} OR LOWER(l.description) LIKE $${params.length})`)
    }

    const where = conditions.join(' AND ')
    params.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(`
      SELECT l.*, o.name AS oblast_name, d.name AS district_name
      FROM listings l
      LEFT JOIN oblasts o ON l.oblast_id = o.id
      LEFT JOIN districts d ON l.district_id = d.id
      WHERE ${where}
      ORDER BY l.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params)

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM listings l WHERE ${where}
    `, params.slice(0, -2))

    res.json({
      listings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/listings/categories
router.get('/categories', (req, res) => {
  res.json([
    { emoji: '🚗', name: 'Транспорт' },
    { emoji: '🐄', name: 'Скот и животные' },
    { emoji: '🏠', name: 'Недвижимость' },
    { emoji: '📱', name: 'Электроника' },
    { emoji: '👗', name: 'Одежда и обувь' },
    { emoji: '🛋', name: 'Мебель и дом' },
    { emoji: '🌾', name: 'С/х и техника' },
    { emoji: '💼', name: 'Работа' },
    { emoji: '📦', name: 'Другое' },
  ])
})

// POST /api/listings/photos — загрузка фото
router.post('/photos', upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Нет файлов' })

    const urls = []
    for (const file of req.files) {
      const compressed = await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer()
      const url = await uploadToR2(compressed, 'image/jpeg')
      urls.push(url)
    }

    res.json({ urls })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка загрузки фото' })
  }
})

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, o.name AS oblast_name, d.name AS district_name
      FROM listings l
      LEFT JOIN oblasts o ON l.oblast_id = o.id
      LEFT JOIN districts d ON l.district_id = d.id
      WHERE l.id = $1 AND l.is_active = true
    `, [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Не найдено' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/listings — создать объявление
router.post('/', async (req, res) => {
  try {
    const {
      title, description, price, is_negotiable,
      category, oblast_id, district_id,
      contact_name, contact_phone, tg_username, photos
    } = req.body

    if (!title || !category || !contact_phone) {
      return res.status(400).json({ error: 'Заполните обязательные поля' })
    }

    const result = await pool.query(`
      INSERT INTO listings (
        title, description, price, is_negotiable, photos,
        category, oblast_id, district_id,
        contact_name, contact_phone, tg_username, source
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'web')
      RETURNING *
    `, [
      title,
      description || null,
      price ? parseInt(price) : null,
      is_negotiable || false,
      photos || [],
      category,
      oblast_id ? parseInt(oblast_id) : null,
      district_id ? parseInt(district_id) : null,
      contact_name || null,
      contact_phone,
      tg_username || null
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
