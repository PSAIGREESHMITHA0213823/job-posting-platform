const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const db = require('../config/db')
const { auth } = require('../middleware/auth')

router.post('/register/employee',
[
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 6 }),
body('full_name').trim().notEmpty()
],
async (req, res) => {
const errors = validationResult(req)
if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

const { email, password, full_name, phone } = req.body
const client = await require('../config/db').pool.connect()

try {
await client.query('BEGIN')

const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
if (existing.rows.length) {
return res.status(409).json({ success: false, message: 'Email already registered' })
}

const hash = await bcrypt.hash(password, 10)
const userResult = await client.query(
'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
[email, hash, 'employee']
)

const user = userResult.rows[0]
await client.query(
'INSERT INTO employee_profiles (user_id, full_name, phone) VALUES ($1, $2, $3)',
[user.id, full_name, phone || null]
)

await client.query('COMMIT')

const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
res.status(201).json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } })
} catch (err) {
await client.query('ROLLBACK')
console.error(err)
res.status(500).json({ success: false, message: 'Registration failed' })
} finally {
client.release()
}
})

router.post('/register/company',
[
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 6 }),
body('full_name').trim().notEmpty(),
body('company_name').trim().notEmpty()
],
async (req, res) => {
const errors = validationResult(req)
if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

const { email, password, full_name, phone, company_name, industry } = req.body
const client = await require('../config/db').pool.connect()

try {
await client.query('BEGIN')

const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
if (existing.rows.length) return res.status(409).json({ success: false, message: 'Email already registered' })

const freePlan = await client.query("SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1")
const planId = freePlan.rows[0]?.id || null

const slug = company_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

const companyResult = await client.query(
'INSERT INTO companies (name, slug, industry, subscription_plan_id) VALUES ($1, $2, $3, $4) RETURNING id',
[company_name, slug, industry || null, planId]
)

const hash = await bcrypt.hash(password, 10)
const userResult = await client.query(
'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
[email, hash, 'company_manager']
)

await client.query(
'INSERT INTO company_managers (user_id, company_id, full_name, phone, is_owner) VALUES ($1, $2, $3, $4, $5)',
[userResult.rows[0].id, companyResult.rows[0].id, full_name, phone || null, true]
)

await client.query('COMMIT')

const token = jwt.sign({ id: userResult.rows[0].id, role: 'company_manager' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
res.status(201).json({ success: true, token, user: { id: userResult.rows[0].id, email, role: 'company_manager' } })
} catch (err) {
await client.query('ROLLBACK')
console.error(err)
res.status(500).json({ success: false, message: 'Registration failed' })
} finally {
client.release()
}
})

router.post('/login',
[body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
async (req, res) => {
const errors = validationResult(req)
if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })

const { email, password } = req.body

try {
const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' })

const user = result.rows[0]
if (!user.is_active) return res.status(403).json({ success: false, message: 'Account deactivated' })

const match = await bcrypt.compare(password, user.password)
if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })

const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
res.json({ success: true, token, user: { id: user.id, email: user.email, role: user.role } })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Login failed' })
}
})

router.get('/me', auth, async (req, res) => {
try {
let profile = null

if (req.user.role === 'employee') {
const r = await db.query('SELECT * FROM employee_profiles WHERE user_id = $1', [req.user.id])
profile = r.rows[0]
} else if (req.user.role === 'company_manager') {
const r = await db.query(
`SELECT cm.*, c.name as company_name, c.id as company_id, c.logo_url, c.is_verified as company_verified
FROM company_managers cm JOIN companies c ON cm.company_id = c.id WHERE cm.user_id = $1`,
[req.user.id]
)
profile = r.rows[0]
}

res.json({ success: true, user: req.user, profile })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch profile' })
}
})

module.exports = router
