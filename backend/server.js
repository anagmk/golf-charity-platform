const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('dotenv').config({ path: __dirname + '/.env' })

const verifyToken = require('./middleware/auth')
const authRoutes = require('./routes/auth')
const scoreRoutes = require('./routes/scores')
const subscriptionRoutes = require('./routes/subscription')
const drawRoutes = require('./routes/draw')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(express.json())


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})