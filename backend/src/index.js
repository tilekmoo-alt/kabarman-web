require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')
const pool = require('./db/pool')

const providersRouter = require('./routes/providers')
const miscRouter = require('./routes/misc')
const listingsRouter = require('./routes/listings')
const authRouter = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3001

async function runMigrations() {
  try {
    await pool.query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'`)
    await pool.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMPTZ`)
    await pool.query(`
      INSERT INTO categories (name, emoji, is_active, sort_order)
      SELECT 'Попутка', '🚌', true, 99
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Попутка')
    `)
  } catch (e) {
    console.error('Migration error:', e.message)
  }
}
runMigrations()

app.set('trust proxy', 1)
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/providers', providersRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/auth', authRouter)
app.use('/api', miscRouter)

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Кабарман API' }))

// В проде отдаём фронтенд
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Кабарман API запущен на порту ${PORT}`)
})
