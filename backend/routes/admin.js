const express = require('express')
const router = express.Router()
const adminOnly = require('../middleware/adminAuth')
const {
  getAllUsers,
  getAllSubscriptions,
  getAllDraws,
  getStats
} = require('../controllers/adminController')

router.get('/users', adminOnly, getAllUsers)
router.get('/subscriptions', adminOnly, getAllSubscriptions)
router.get('/draws', adminOnly, getAllDraws)
router.get('/stats', adminOnly, getStats)

module.exports = router