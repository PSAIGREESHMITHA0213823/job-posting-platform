const jwt = require('jsonwebtoken')

const generateToken = (userId, role) => {
return jwt.sign(
{ id: userId, role },
process.env.JWT_SECRET,
{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
)
}

const paginate = (page, limit) => {
const p = Math.max(1, parseInt(page) || 1)
const l = Math.min(100, Math.max(1, parseInt(limit) || 20))
return { offset: (p - 1) * l, limit: l, page: p }
}

const slugify = (text) => {
return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

const asyncHandler = (fn) => (req, res, next) => {
Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { generateToken, paginate, slugify, asyncHandler }
