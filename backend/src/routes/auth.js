const router = require('express').Router()
const jwt = require('jsonwebtoken')
const pool = require('../db/pool')

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BACKEND_URL   = process.env.BACKEND_URL || 'https://prolific-purpose-production-12cc.up.railway.app'
const REDIRECT_URI  = `${BACKEND_URL}/auth/google/callback`
const JWT_SECRET    = process.env.JWT_SECRET || 'kabarman_secret_change_me'
const FRONTEND_URL  = process.env.FRONTEND_URL || 'https://kabarman.kg'

// GET /auth/google — редирект на Google
router.get('/google', (req, res) => {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    prompt:        'select_account',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// GET /auth/google/callback — Google возвращает code
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query
  console.log('[auth] callback received, code:', !!code, 'error:', error)
  console.log('[auth] CLIENT_ID set:', !!CLIENT_ID, 'CLIENT_SECRET set:', !!CLIENT_SECRET)
  console.log('[auth] REDIRECT_URI:', REDIRECT_URI)
  if (error || !code) return res.redirect(`${FRONTEND_URL}/?auth=error`)

  try {
    // Меняем code на токен
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    console.log('[auth] tokenData keys:', Object.keys(tokenData), 'error:', tokenData.error)
    if (!tokenData.access_token) return res.redirect(`${FRONTEND_URL}/?auth=error`)

    // Получаем данные пользователя
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const googleUser = await userRes.json()

    // Создаём или находим пользователя в БД
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

    // Редиректим на фронт с токеном
    res.redirect(`${FRONTEND_URL}/?token=${token}`)
  } catch (err) {
    console.error('Auth error:', err)
    res.redirect(`${FRONTEND_URL}/?auth=error`)
  }
})

// GET /auth/me — текущий пользователь
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
