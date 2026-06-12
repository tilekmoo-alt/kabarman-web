const router = require('express').Router()
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

const JWT_SECRET   = process.env.JWT_SECRET || 'kabarman_secret_change_me'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kabarman.kg'

// POST /api/auth/google-verify — получаем access_token от фронта, проверяем у Google
router.post('/google-verify', async (req, res) => {
  const { access_token } = req.body
  if (!access_token) return res.status(400).json({ error: 'Нет токена' })

  try {
    // Получаем данные пользователя от Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!userRes.ok) return res.status(401).json({ error: 'Токен Google недействителен' })

    const googleUser = await userRes.json()
    console.log('[auth] Google user:', googleUser.email)

    // Создаём или обновляем пользователя в БД
    const result = await pool.query(`
      INSERT INTO users (google_id, email, name, avatar_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (google_id) DO UPDATE
        SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
      RETURNING *
    `, [googleUser.id, googleUser.email, googleUser.name, googleUser.picture])

    const user = result.rows[0]

    // Выдаём JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatar: user.avatar_url },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar_url } })
  } catch (err) {
    console.error('[auth] google-verify error:', err)
    res.status(500).json({ error: 'Ошибка авторизации' })
  }
})

// GET /api/auth/me — текущий пользователь по JWT
router.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Не авторизован' })
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET)
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Токен недействителен' })
  }
})

module.exports = router
