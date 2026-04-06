const db = require('../../config/db')
const path = require('path')

const getCompanyProfile = async (req, res) => {
try {
const mgr = await db.query(
'SELECT cm.*, c.* FROM company_managers cm JOIN companies c ON cm.company_id = c.id WHERE cm.user_id = $1',
[req.user.id]
)
if (!mgr.rows.length) return res.status(404).json({ success: false, message: 'Company not found' })
res.json({ success: true, data: mgr.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch profile' })
}
}

const updateCompanyProfile = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
if (!mgr.rows.length) return res.status(404).json({ success: false, message: 'Not found' })

const { name, description, industry, company_size, website, address, city, country } = req.body
const logo_url = req.file ? `/uploads/logos/${req.file.filename}` : undefined

const sets = []
const vals = []
let i = 1

if (name) { sets.push(`name = $${i++}`); vals.push(name) }
if (description) { sets.push(`description = $${i++}`); vals.push(description) }
if (industry) { sets.push(`industry = $${i++}`); vals.push(industry) }
if (company_size) { sets.push(`company_size = $${i++}`); vals.push(company_size) }
if (website) { sets.push(`website = $${i++}`); vals.push(website) }
if (address) { sets.push(`address = $${i++}`); vals.push(address) }
if (city) { sets.push(`city = $${i++}`); vals.push(city) }
if (country) { sets.push(`country = $${i++}`); vals.push(country) }
if (logo_url) { sets.push(`logo_url = $${i++}`); vals.push(logo_url) }

sets.push(`updated_at = NOW()`)
vals.push(mgr.rows[0].company_id)

const result = await db.query(
`UPDATE companies SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
vals
)
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const getDashboard = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
if (!mgr.rows.length) return res.status(404).json({ success: false, message: 'Not found' })

const cid = mgr.rows[0].company_id

const [jobs, apps, views] = await Promise.all([
db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active, COUNT(*) FILTER (WHERE status = 'closed') as closed FROM job_postings WHERE company_id = $1`, [cid]),
db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE ja.status = 'pending') as pending, COUNT(*) FILTER (WHERE ja.status = 'shortlisted') as shortlisted, COUNT(*) FILTER (WHERE ja.status = 'hired') as hired FROM job_applications ja JOIN job_postings jp ON ja.job_id = jp.id WHERE jp.company_id = $1`, [cid]),
db.query('SELECT COALESCE(SUM(views), 0) as total_views FROM job_postings WHERE company_id = $1', [cid])
])

const recent = await db.query(`
SELECT jp.title, jp.status, COUNT(ja.id) as applications, jp.views, jp.created_at
FROM job_postings jp LEFT JOIN job_applications ja ON ja.job_id = jp.id
WHERE jp.company_id = $1 GROUP BY jp.id ORDER BY jp.created_at DESC LIMIT 5`, [cid])

res.json({ success: true, data: { jobs: jobs.rows[0], applications: apps.rows[0], views: views.rows[0], recent_jobs: recent.rows } })
} catch (err) {
res.status(500).json({ success: false, message: 'Dashboard error' })
}
}

const createJob = async (req, res) => {
try {
const mgr = await db.query(
'SELECT cm.id, cm.company_id, c.subscription_plan_id FROM company_managers cm JOIN companies c ON cm.company_id = c.id WHERE cm.user_id = $1',
[req.user.id]
)
if (!mgr.rows.length) return res.status(404).json({ success: false, message: 'Not found' })

const { company_id, id: manager_id, subscription_plan_id } = mgr.rows[0]

const plan = await db.query('SELECT max_job_postings FROM subscription_plans WHERE id = $1', [subscription_plan_id])
const maxJobs = plan.rows[0]?.max_job_postings || 3

const activeJobs = await db.query("SELECT COUNT(*) FROM job_postings WHERE company_id = $1 AND status != 'closed'", [company_id])
if (parseInt(activeJobs.rows[0].count) >= maxJobs) {
return res.status(403).json({ success: false, message: `Your plan allows max ${maxJobs} active job postings` })
}

const {
title, description, requirements, responsibilities,
employment_type, location, is_remote, salary_min, salary_max,
salary_currency, experience_required, skills_required,
category, openings, status, application_deadline
} = req.body

const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

const result = await db.query(`
INSERT INTO job_postings (
company_id, posted_by, title, slug, description, requirements, responsibilities,
employment_type, location, is_remote, salary_min, salary_max, salary_currency,
experience_required, skills_required, category, openings, status, application_deadline
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
[
company_id, manager_id, title, slug, description, requirements, responsibilities,
employment_type || 'full_time', location, is_remote || false,
salary_min || null, salary_max || null, salary_currency || 'USD',
experience_required || 0, skills_required || [], category, openings || 1,
status || 'draft', application_deadline || null
])

res.status(201).json({ success: true, data: result.rows[0] })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Job creation failed' })
}
}

const getMyJobs = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
const { status, page = 1, limit = 10 } = req.query
const offset = (page - 1) * limit

let query = `
SELECT jp.*, COUNT(ja.id) as application_count
FROM job_postings jp LEFT JOIN job_applications ja ON ja.job_id = jp.id
WHERE jp.company_id = $1`

const params = [mgr.rows[0].company_id]

if (status) { params.push(status); query += ` AND jp.status = $${params.length}` }

query += ` GROUP BY jp.id ORDER BY jp.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
params.push(limit, offset)

const result = await db.query(query, params)
res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch jobs' })
}
}

const updateJob = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
const cid = mgr.rows[0].company_id

const exists = await db.query('SELECT id FROM job_postings WHERE id = $1 AND company_id = $2', [req.params.id, cid])
if (!exists.rows.length) return res.status(404).json({ success: false, message: 'Job not found' })

const {
title, description, requirements, responsibilities,
employment_type, location, is_remote, salary_min, salary_max,
experience_required, skills_required, category, openings, status, application_deadline
} = req.body

const result = await db.query(`
UPDATE job_postings SET
title = COALESCE($1, title), description = COALESCE($2, description),
requirements = COALESCE($3, requirements), responsibilities = COALESCE($4, responsibilities),
employment_type = COALESCE($5, employment_type), location = COALESCE($6, location),
is_remote = COALESCE($7, is_remote), salary_min = COALESCE($8, salary_min),
salary_max = COALESCE($9, salary_max), experience_required = COALESCE($10, experience_required),
skills_required = COALESCE($11, skills_required), category = COALESCE($12, category),
openings = COALESCE($13, openings), status = COALESCE($14, status),
application_deadline = COALESCE($15, application_deadline), updated_at = NOW()
WHERE id = $16 RETURNING *`,
[title, description, requirements, responsibilities, employment_type, location,
is_remote, salary_min, salary_max, experience_required, skills_required,
category, openings, status, application_deadline, req.params.id])

res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const deleteJob = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
const result = await db.query(
'DELETE FROM job_postings WHERE id = $1 AND company_id = $2 RETURNING id',
[req.params.id, mgr.rows[0].company_id]
)
if (!result.rows.length) return res.status(404).json({ success: false, message: 'Job not found' })
res.json({ success: true, message: 'Job deleted' })
} catch (err) {
res.status(500).json({ success: false, message: 'Delete failed' })
}
}

const getJobApplicants = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
const { status, page = 1, limit = 20 } = req.query
const offset = (page - 1) * limit

const owns = await db.query('SELECT id FROM job_postings WHERE id = $1 AND company_id = $2', [req.params.jobId, mgr.rows[0].company_id])
if (!owns.rows.length) return res.status(403).json({ success: false, message: 'Access denied' })

let query = `
SELECT ja.*, ep.full_name, ep.headline, ep.skills, ep.experience_years,
ep.resume_url as profile_resume, u.email
FROM job_applications ja
JOIN employee_profiles ep ON ja.employee_id = ep.id
JOIN users u ON ep.user_id = u.id
WHERE ja.job_id = $1`

const params = [req.params.jobId]
if (status) { params.push(status); query += ` AND ja.status = $${params.length}` }
query += ` ORDER BY ja.applied_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
params.push(limit, offset)

const result = await db.query(query, params)
const count = await db.query('SELECT COUNT(*) FROM job_applications WHERE job_id = $1', [req.params.jobId])

res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count) })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch applicants' })
}
}

const updateApplicationStatus = async (req, res) => {
try {
const mgr = await db.query('SELECT company_id FROM company_managers WHERE user_id = $1', [req.user.id])
const { status, rejection_reason } = req.body

const owns = await db.query(
'SELECT ja.id FROM job_applications ja JOIN job_postings jp ON ja.job_id = jp.id WHERE ja.id = $1 AND jp.company_id = $2',
[req.params.appId, mgr.rows[0].company_id]
)
if (!owns.rows.length) return res.status(403).json({ success: false, message: 'Access denied' })

const result = await db.query(
'UPDATE job_applications SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
[status, rejection_reason || null, req.params.appId]
)

const app = result.rows[0]
const empInfo = await db.query(
'SELECT ep.user_id, jp.title FROM job_applications ja JOIN employee_profiles ep ON ja.employee_id = ep.id JOIN job_postings jp ON ja.job_id = jp.id WHERE ja.id = $1',
[req.params.appId]
)

if (empInfo.rows.length) {
await db.query(
'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES ($1, $2, $3, $4, $5)',
[empInfo.rows[0].user_id, 'Application Update', `Your application for "${empInfo.rows[0].title}" has been ${status}`, 'application', req.params.appId]
)
}

res.json({ success: true, data: app })
} catch (err) {
res.status(500).json({ success: false, message: 'Update failed' })
}
}

module.exports = {
getCompanyProfile,
updateCompanyProfile,
getDashboard,
createJob,
getMyJobs,
updateJob,
deleteJob,
getJobApplicants,
updateApplicationStatus
}
