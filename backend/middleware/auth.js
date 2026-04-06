const jwt = require('jsonwebtoken')
const db = require('../config/db')

const auth = async (req, res, next) => {
try {
const header = req.headers.authorization
if (!header || !header.startsWith('Bearer ')) {
return res.status(401).json({ success: false, message: 'No token provided' })
}

const token = header.split(' ')[1]
const decoded = jwt.verify(token, process.env.JWT_SECRET)

const result = await db.query('SELECT id, email, role, is_active FROM users WHERE id = $1', [decoded.id])
if (!result.rows.length || !result.rows[0].is_active) {
return res.status(401).json({ success: false, message: 'User not found or inactive' })
}

req.user = result.rows[0]
next()
} catch (err) {
return res.status(401).json({ success: false, message: 'Invalid token' })
}
}

const requireRole = (...roles) => {
return (req, res, next) => {
if (!roles.includes(req.user.role)) {
return res.status(403).json({ success: false, message: 'Access denied' })
}
next()
}
}

module.exports = { auth, requireRole }
