const express = require('express')
const cors = require('cors')
require('dotenv').config()

const verifyToken = require('../middleware/auth')
const authRoutes = require('../routes/auth')
const scoreRoutes = require('../routes/scores')
const subscriptionRoutes = require('../routes/subscription')
const drawRoutes = require('../routes/draw')
const adminRoutes = require('../routes/admin')

const app = express()

app.use(express.json())

app.use(cors({
  origin: [
    'https://golf-charity-platform-jade.vercel.app',
    'https://golf-charity-platform-jade-*.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.options('*', cors())

app.use('/api/auth', authRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/draws', drawRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Golf Charity API is running!' })
})

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'You are inside a protected route!', user: req.user })
})

module.exports = app
