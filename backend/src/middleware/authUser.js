const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'kabarman_secret_change_me'

module.exports = function authUser(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Не авторизован' })
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Токен недействителен' })
  }
}
