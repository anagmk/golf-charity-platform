const express = require('express')
const cors = require('cors')
require('dotenv').config({ path: __dirname + '/.env' })

const authRoutes = require('./routes/auth')
const scoreRoutes = require('./routes/scores')
const subscriptionRoutes = require('./routes/subscription')
const drawRoutes = require('./routes/draw')
const adminRoutes = require('./routes/admin')
const verifyToken = require('./middleware/auth')

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/draws', drawRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Golf Charity API is running!' })
})

const PORT = process.env.PORT || 3000

// only listen locally — not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = app