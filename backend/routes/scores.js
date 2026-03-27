const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const { addScore, getScores } = require('../controllers/scoreControllers')

router.post('/', verifyToken, addScore)
router.get('/', verifyToken, getScores)

module.exports = router