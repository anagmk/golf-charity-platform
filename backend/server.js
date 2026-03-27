require('dotenv').config()
const app = require('./api/index.js')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})