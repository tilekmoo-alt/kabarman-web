const jwt = require('jsonwebtoken')

const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Только для администраторов' })
    req.admin = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Недействительный токен' })
  }
}

module.exports = { authAdmin }
