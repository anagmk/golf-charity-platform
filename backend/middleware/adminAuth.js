const verifyToken = require('./auth')

const adminOnly = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Admin access only.' }
      })
    }
    next()
  })
}

module.exports = adminOnly