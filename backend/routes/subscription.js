const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const {
  createSubscription,
  getSubscription,
  cancelSubscription
} = require('../controllers/subscriptionController')

router.post('/', verifyToken, createSubscription)
router.get('/', verifyToken, getSubscription)
router.put('/cancel', verifyToken, cancelSubscription)

module.exports = router