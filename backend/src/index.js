require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const path = require('path')

const providersRouter = require('./routes/providers')
const miscRouter = require('./routes/misc')
const listingsRouter = require('./routes/listings')

const app = express()
const PORT = process.env.PORT || 3001

app.set('trust proxy', 1)
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/providers', providersRouter)
app.use('/api/listings', listingsRouter)
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
