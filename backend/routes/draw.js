const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const { runDraw, getDrawResults, getMyResults } = require('../controllers/drawController')

router.post('/run', verifyToken, runDraw)
router.get('/results', verifyToken, getDrawResults)
router.get('/my-results', verifyToken, getMyResults)

module.exports = router