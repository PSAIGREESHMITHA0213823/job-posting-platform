const db = require('../../config/db')
const bcrypt = require('bcryptjs')

const getDashboard = async (req, res) => {
try {
const [users, companies, jobs, apps, revenue] = await Promise.all([
db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE role = 'employee') as employees, COUNT(*) FILTER (WHERE role = 'company_manager') as managers FROM users"),
db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_verified = true) as verified FROM companies"),
db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM job_postings"),
db.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'hired') as hired FROM job_applications"),
db.query("SELECT COALESCE(SUM(amount), 0) as total_revenue, COUNT(*) as total_payments FROM payments WHERE status = 'completed'")
])

const monthly = await db.query(`
SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COALESCE(SUM(amount), 0) as revenue
FROM payments WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at)
`)

res.json({
success: true,
data: {
users: users.rows[0],
companies: companies.rows[0],
jobs: jobs.rows[0],
applications: apps.rows[0],
revenue: revenue.rows[0],
monthly_revenue: monthly.rows
}
})
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Failed to load dashboard' })
}
}

const getAllCompanies = async (req, res) => {
try {
const { page = 1, limit = 20, search, verified, active } = req.query
const offset = (page - 1) * limit
const params = []
const conditions = []

if (search) { params.push(`%${search}%`); conditions.push(`c.name ILIKE $${params.length}`) }
if (verified !== undefined) { params.push(verified === 'true'); conditions.push(`c.is_verified = $${params.length}`) }
if (active !== undefined) { params.push(active === 'true'); conditions.push(`c.is_active = $${params.length}`) }

const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
params.push(limit, offset)

const result = await db.query(`
SELECT c.*, sp.name as plan_name,
COUNT(DISTINCT cm.id) as manager_count,
COUNT(DISTINCT jp.id) as job_count
FROM companies c
LEFT JOIN subscription_plans sp ON c.subscription_plan_id = sp.id
LEFT JOIN company_managers cm ON cm.company_id = c.id
LEFT JOIN job_postings jp ON jp.company_id = c.id
${where}
GROUP BY c.id, sp.name
ORDER BY c.created_at DESC
LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

const count = await db.query(`SELECT COUNT(*) FROM companies c ${where}`, params.slice(0, -2))

res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Failed to fetch companies' })
}
}

const toggleCompanyStatus = async (req, res) => {
try {
const { id } = req.params
const result = await db.query(
'UPDATE companies SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_active',
[id]
)
if (!result.rows.length) return res.status(404).json({ success: false, message: 'Company not found' })
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const verifyCompany = async (req, res) => {
try {
const result = await db.query(
'UPDATE companies SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_verified',
[req.params.id]
)
if (!result.rows.length) return res.status(404).json({ success: false, message: 'Company not found' })
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Verification failed' })
}
}

const getAllUsers = async (req, res) => {
try {
const { page = 1, limit = 20, role, search, active } = req.query
const offset = (page - 1) * limit
const params = []
const conditions = []

if (role) { params.push(role); conditions.push(`u.role = $${params.length}`) }
if (search) { params.push(`%${search}%`); conditions.push(`u.email ILIKE $${params.length}`) }
if (active !== undefined) { params.push(active === 'true'); conditions.push(`u.is_active = $${params.length}`) }

const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
params.push(limit, offset)

const result = await db.query(`
SELECT u.id, u.email, u.role, u.is_active, u.is_verified, u.created_at,
COALESCE(ep.full_name, cm.full_name) as full_name
FROM users u
LEFT JOIN employee_profiles ep ON ep.user_id = u.id
LEFT JOIN company_managers cm ON cm.user_id = u.id
${where}
ORDER BY u.created_at DESC
LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

const count = await db.query(`SELECT COUNT(*) FROM users u ${where}`, params.slice(0, -2))

res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count) })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch users' })
}
}

const toggleUserStatus = async (req, res) => {
try {
const result = await db.query(
'UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 AND role != $2 RETURNING id, email, is_active',
[req.params.id, 'admin']
)
if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' })
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const getSubscriptionPlans = async (req, res) => {
try {
const result = await db.query('SELECT * FROM subscription_plans ORDER BY price ASC')
res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch plans' })
}
}

const updateSubscriptionPlan = async (req, res) => {
try {
const { name, max_job_postings, max_applications_per_job, price, duration_days, features, is_active } = req.body
const result = await db.query(`
UPDATE subscription_plans SET
name = COALESCE($1, name),
max_job_postings = COALESCE($2, max_job_postings),
max_applications_per_job = COALESCE($3, max_applications_per_job),
price = COALESCE($4, price),
duration_days = COALESCE($5, duration_days),
features = COALESCE($6, features),
is_active = COALESCE($7, is_active)
WHERE id = $8 RETURNING *`,
[name, max_job_postings, max_applications_per_job, price, duration_days, features ? JSON.stringify(features) : null, is_active, req.params.id]
)
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const getPayments = async (req, res) => {
try {
const { page = 1, limit = 20, status } = req.query
const offset = (page - 1) * limit
const params = []
const conditions = []

if (status) { params.push(status); conditions.push(`p.status = $${params.length}`) }
const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
params.push(limit, offset)

const result = await db.query(`
SELECT p.*, c.name as company_name, sp.name as plan_name
FROM payments p
JOIN companies c ON p.company_id = c.id
JOIN subscription_plans sp ON p.plan_id = sp.id
${where}
ORDER BY p.created_at DESC
LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch payments' })
}
}

module.exports = {
getDashboard,
getAllCompanies,
toggleCompanyStatus,
verifyCompany,
getAllUsers,
toggleUserStatus,
getSubscriptionPlans,
updateSubscriptionPlan,
getPayments
}
