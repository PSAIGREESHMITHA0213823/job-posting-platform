const db = require('../../config/db')

const getProfile = async (req, res) => {
try {
const result = await db.query('SELECT * FROM employee_profiles WHERE user_id = $1', [req.user.id])
if (!result.rows.length) return res.status(404).json({ success: false, message: 'Profile not found' })
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch profile' })
}
}

const updateProfile = async (req, res) => {
try {
const { full_name, phone, headline, summary, location, date_of_birth, gender, skills, experience_years, education, work_experience, social_links } = req.body

const resume_url = req.file ? `/uploads/resumes/${req.file.filename}` : undefined

const sets = []
const vals = []
let i = 1

const fields = { full_name, phone, headline, summary, location, date_of_birth, gender, experience_years }
for (const [key, val] of Object.entries(fields)) {
if (val !== undefined) { sets.push(`${key} = $${i++}`); vals.push(val) }
}

if (skills) { sets.push(`skills = $${i++}`); vals.push(Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) }
if (education) { sets.push(`education = $${i++}`); vals.push(JSON.stringify(education)) }
if (work_experience) { sets.push(`work_experience = $${i++}`); vals.push(JSON.stringify(work_experience)) }
if (social_links) { sets.push(`social_links = $${i++}`); vals.push(JSON.stringify(social_links)) }
if (resume_url) { sets.push(`resume_url = $${i++}`); vals.push(resume_url) }

if (!sets.length) return res.status(400).json({ success: false, message: 'Nothing to update' })

sets.push(`updated_at = NOW()`)
vals.push(req.user.id)

const result = await db.query(
`UPDATE employee_profiles SET ${sets.join(', ')} WHERE user_id = $${i} RETURNING *`, vals
)
res.json({ success: true, data: result.rows[0] })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Update failed' })
}
}

const browseJobs = async (req, res) => {
try {
const { search, category, employment_type, location, is_remote, salary_min, experience, page = 1, limit = 20 } = req.query
const offset = (page - 1) * limit
const params = []
const conditions = ["jp.status = 'active'"]

if (search) {
params.push(`%${search}%`)
conditions.push(`(jp.title ILIKE $${params.length} OR jp.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`)
}
if (category) { params.push(category); conditions.push(`jp.category = $${params.length}`) }
if (employment_type) { params.push(employment_type); conditions.push(`jp.employment_type = $${params.length}`) }
if (location) { params.push(`%${location}%`); conditions.push(`jp.location ILIKE $${params.length}`) }
if (is_remote === 'true') conditions.push(`jp.is_remote = true`)
if (salary_min) { params.push(salary_min); conditions.push(`jp.salary_min >= $${params.length}`) }
if (experience) { params.push(experience); conditions.push(`jp.experience_required <= $${params.length}`) }

const where = 'WHERE ' + conditions.join(' AND ')
params.push(limit, offset)

const result = await db.query(`
SELECT jp.id, jp.title, jp.slug, jp.employment_type, jp.location, jp.is_remote,
jp.salary_min, jp.salary_max, jp.salary_currency, jp.experience_required,
jp.skills_required, jp.category, jp.openings, jp.application_deadline,
jp.views, jp.created_at, c.name as company_name, c.logo_url, c.city, c.is_verified as company_verified,
COUNT(ja.id) as application_count
FROM job_postings jp
JOIN companies c ON jp.company_id = c.id
LEFT JOIN job_applications ja ON ja.job_id = jp.id
${where}
GROUP BY jp.id, c.id
ORDER BY jp.created_at DESC
LIMIT $${params.length - 1} OFFSET $${params.length}`, params)

await db.query('UPDATE job_postings SET views = views + 1 WHERE id = ANY($1::uuid[])', [result.rows.map(r => r.id)])

const count = await db.query(`SELECT COUNT(DISTINCT jp.id) FROM job_postings jp JOIN companies c ON jp.company_id = c.id ${where}`, params.slice(0, -2))

res.json({ success: true, data: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Failed to browse jobs' })
}
}

const getJobDetail = async (req, res) => {
try {
const result = await db.query(`
SELECT jp.*, c.name as company_name, c.logo_url, c.description as company_description,
c.website, c.city, c.country, c.company_size, c.industry, c.is_verified as company_verified
FROM job_postings jp JOIN companies c ON jp.company_id = c.id
WHERE jp.id = $1 AND jp.status = 'active'`, [req.params.id])

if (!result.rows.length) return res.status(404).json({ success: false, message: 'Job not found' })
res.json({ success: true, data: result.rows[0] })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch job' })
}
}

const applyToJob = async (req, res) => {
try {
const profile = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [req.user.id])
if (!profile.rows.length) return res.status(400).json({ success: false, message: 'Complete your profile first' })

const empId = profile.rows[0].id
const { job_id, cover_letter } = req.body
const resume_url = req.file ? `/uploads/resumes/${req.file.filename}` : null

const job = await db.query(
"SELECT jp.*, c.subscription_plan_id FROM job_postings jp JOIN companies c ON jp.company_id = c.id WHERE jp.id = $1 AND jp.status = 'active'",
[job_id]
)
if (!job.rows.length) return res.status(404).json({ success: false, message: 'Job not found or closed' })

const alreadyApplied = await db.query('SELECT id FROM job_applications WHERE job_id = $1 AND employee_id = $2', [job_id, empId])
if (alreadyApplied.rows.length) return res.status(409).json({ success: false, message: 'Already applied to this job' })

const plan = await db.query('SELECT max_applications_per_job FROM subscription_plans WHERE id = $1', [job.rows[0].subscription_plan_id])
const maxApps = plan.rows[0]?.max_applications_per_job || 50

const appCount = await db.query('SELECT COUNT(*) FROM job_applications WHERE job_id = $1', [job_id])
if (parseInt(appCount.rows[0].count) >= maxApps) {
return res.status(403).json({ success: false, message: 'Application limit reached for this job' })
}

const result = await db.query(
'INSERT INTO job_applications (job_id, employee_id, cover_letter, resume_url) VALUES ($1, $2, $3, $4) RETURNING *',
[job_id, empId, cover_letter || null, resume_url]
)

res.status(201).json({ success: true, data: result.rows[0] })
} catch (err) {
console.error(err)
res.status(500).json({ success: false, message: 'Application failed' })
}
}

const getMyApplications = async (req, res) => {
try {
const profile = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [req.user.id])
const { status, page = 1, limit = 10 } = req.query
const offset = (page - 1) * limit

let query = `
SELECT ja.id, ja.status, ja.cover_letter, ja.applied_at, ja.updated_at, ja.rejection_reason,
jp.title, jp.employment_type, jp.location, jp.salary_min, jp.salary_max,
c.name as company_name, c.logo_url
FROM job_applications ja
JOIN job_postings jp ON ja.job_id = jp.id
JOIN companies c ON jp.company_id = c.id
WHERE ja.employee_id = $1`

const params = [profile.rows[0].id]
if (status) { params.push(status); query += ` AND ja.status = $${params.length}` }
query += ` ORDER BY ja.applied_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
params.push(limit, offset)

const result = await db.query(query, params)
res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch applications' })
}
}

const saveJob = async (req, res) => {
try {
const profile = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [req.user.id])
const empId = profile.rows[0].id

const existing = await db.query('SELECT id FROM saved_jobs WHERE employee_id = $1 AND job_id = $2', [empId, req.params.jobId])

if (existing.rows.length) {
await db.query('DELETE FROM saved_jobs WHERE employee_id = $1 AND job_id = $2', [empId, req.params.jobId])
return res.json({ success: true, saved: false, message: 'Job unsaved' })
}

await db.query('INSERT INTO saved_jobs (employee_id, job_id) VALUES ($1, $2)', [empId, req.params.jobId])
res.json({ success: true, saved: true, message: 'Job saved' })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to toggle save' })
}
}

const getSavedJobs = async (req, res) => {
try {
const profile = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [req.user.id])
const result = await db.query(`
SELECT sj.saved_at, jp.id, jp.title, jp.employment_type, jp.location, jp.salary_min, jp.salary_max, jp.status,
c.name as company_name, c.logo_url
FROM saved_jobs sj
JOIN job_postings jp ON sj.job_id = jp.id
JOIN companies c ON jp.company_id = c.id
WHERE sj.employee_id = $1
ORDER BY sj.saved_at DESC`, [profile.rows[0].id])
res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch saved jobs' })
}
}

const getNotifications = async (req, res) => {
try {
const result = await db.query(
'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
[req.user.id]
)
await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false', [req.user.id])
res.json({ success: true, data: result.rows })
} catch (err) {
res.status(500).json({ success: false, message: 'Failed to fetch notifications' })
}
}

module.exports = {
getProfile,
updateProfile,
browseJobs,
getJobDetail,
applyToJob,
getMyApplications,
saveJob,
getSavedJobs,
getNotifications
}
