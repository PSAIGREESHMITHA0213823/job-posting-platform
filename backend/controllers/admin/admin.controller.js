
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

const getRevenue = async (req, res) => {
  try {
    const [summary, monthly, byPlan] = await Promise.all([
      db.query(`
        SELECT
          COALESCE(SUM(amount), 0)            AS total_revenue,
          COUNT(*)                            AS total_payments,
          COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
            THEN amount ELSE 0 END), 0)       AS monthly_revenue
        FROM payments WHERE status = 'completed'
      `),
      db.query(`
        SELECT TO_CHAR(created_at, 'Mon YYYY') AS month,
               COALESCE(SUM(amount), 0)        AS revenue
        FROM payments
        WHERE status = 'completed'
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
      db.query(`
        SELECT sp.name AS plan, COALESCE(SUM(p.amount), 0) AS revenue, COUNT(*) AS count
        FROM payments p
        JOIN subscription_plans sp ON p.plan_id = sp.id
        WHERE p.status = 'completed'
        GROUP BY sp.name
        ORDER BY revenue DESC
      `)
    ])
    res.json({
      success: true,
      data: {
        summary:  summary.rows[0],   
        monthly:  monthly.rows,      
        by_plan:  byPlan.rows       
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to fetch revenue' })
  }
}
const getSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM admin_settings LIMIT 1')
    if (!result.rows.length) {
      return res.json({
        success: true,
        data: { site_name: '', contact_email: '', maintenance_mode: false }
      })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to fetch settings' })
  }
}

const updateSettings = async (req, res) => {
  try {
    const { site_name, contact_email, maintenance_mode } = req.body
    const result = await db.query(`
      INSERT INTO admin_settings (id, site_name, contact_email, maintenance_mode, updated_at)
      VALUES (1, $1, $2, $3, NOW())
      ON CONFLICT (id) DO UPDATE SET
        site_name        = EXCLUDED.site_name,
        contact_email    = EXCLUDED.contact_email,
        maintenance_mode = EXCLUDED.maintenance_mode,
        updated_at       = NOW()
      RETURNING *
    `, [site_name || '', contact_email || '', maintenance_mode || false])
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to update settings' })
  }
}
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, verified, active } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conditions = []
    if (search) { params.push(`%${search}%`); conditions.push(`c.name ILIKE $${params.length}`) }
    if (verified !== undefined && verified !== '') { params.push(verified === 'true'); conditions.push(`c.is_verified = $${params.length}`) }
    if (active !== undefined && active !== '') { params.push(active === 'true'); conditions.push(`c.is_active = $${params.length}`) }
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

const createCompany = async (req, res) => {
  try {
    const { name, description, industry, company_size, website, address, city, country, plan_name, is_verified, is_active } = req.body
    const planRes = await db.query(`SELECT id FROM subscription_plans WHERE name = $1`, [plan_name || 'free'])
    const planId = planRes.rows[0]?.id || null
    const result = await db.query(
      `INSERT INTO companies (name, description, industry, company_size, website, address, city, country, is_verified, is_active, subscription_plan_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [name, description || null, industry || null, company_size || null, website || null, address || null, city || null, country || null, is_verified || false, is_active !== false, planId]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, industry, company_size, website, address, city, country, plan_name, is_verified, is_active } = req.body
    let planId = null
    if (plan_name) {
      const planRes = await db.query(`SELECT id FROM subscription_plans WHERE name = $1`, [plan_name])
      planId = planRes.rows[0]?.id || null
    }
    const result = await db.query(
      `UPDATE companies SET
        name = COALESCE($1, name), description = COALESCE($2, description),
        industry = COALESCE($3, industry), company_size = COALESCE($4, company_size),
        website = COALESCE($5, website), address = COALESCE($6, address),
        city = COALESCE($7, city), country = COALESCE($8, country),
        subscription_plan_id = COALESCE($9, subscription_plan_id),
        is_verified = COALESCE($10, is_verified), is_active = COALESCE($11, is_active),
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [name, description, industry, company_size, website, address, city, country, planId, is_verified, is_active, id]
    )
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Company not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(`DELETE FROM companies WHERE id = $1 RETURNING id`, [id])
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Company not found' })
    res.json({ success: true, message: 'Company deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const toggleCompanyStatus = async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE companies SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_active',
      [req.params.id]
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

// ─── USERS ───────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, active } = req.query
    const offset = (page - 1) * limit
    const params = []
    const conditions = []
    if (role) { params.push(role); conditions.push(`u.role = $${params.length}`) }
    if (search) { params.push(`%${search}%`); conditions.push(`u.email ILIKE $${params.length}`) }
    if (active !== undefined && active !== '') { params.push(active === 'true'); conditions.push(`u.is_active = $${params.length}`) }
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

const createUser = async (req, res) => {
  try {
    const { email, password, role, full_name, is_active } = req.body
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const userRes = await db.query(
      `INSERT INTO users (email, password, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, role, is_active`,
      [email, hashedPassword, role, is_active !== false, false]
    )
    const newUser = userRes.rows[0]
    if (role === 'employee') {
      await db.query(`INSERT INTO employee_profiles (user_id, full_name) VALUES ($1, $2)`, [newUser.id, full_name || ''])
    } else if (role === 'company_manager') {
      await db.query(`INSERT INTO company_managers (user_id, full_name) VALUES ($1, $2)`, [newUser.id, full_name || ''])
    } else if (role === 'admin') {
      await db.query(`INSERT INTO admin_profiles (user_id, full_name) VALUES ($1, $2)`, [newUser.id, full_name || ''])
    }
    res.json({ success: true, data: newUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { email, password, role, full_name, is_active } = req.body
    let updateQuery = `UPDATE users SET email = COALESCE($1, email), role = COALESCE($2, role), is_active = COALESCE($3, is_active), updated_at = NOW()`
    const params = [email, role, is_active]
    if (password) {
      const hashed = await bcrypt.hash(password, 10)
      updateQuery += `, password = $4`
      params.push(hashed)
    }
    updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, email, role, is_active`
    params.push(id)
    const result = await db.query(updateQuery, params)
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' })
    if (full_name) {
      const roleRes = await db.query(`SELECT role FROM users WHERE id = $1`, [id])
      const userRole = roleRes.rows[0]?.role
      if (userRole === 'employee') {
        await db.query(`UPDATE employee_profiles SET full_name = $1 WHERE user_id = $2`, [full_name, id])
      } else if (userRole === 'company_manager') {
        await db.query(`UPDATE company_managers SET full_name = $1 WHERE user_id = $2`, [full_name, id])
      } else if (userRole === 'admin') {
        await db.query(`UPDATE admin_profiles SET full_name = $1 WHERE user_id = $2`, [full_name, id])
      }
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(`DELETE FROM users WHERE id = $1 AND role != 'admin' RETURNING id`, [id])
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found or cannot delete admin' })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
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
      name = COALESCE($1, name), max_job_postings = COALESCE($2, max_job_postings),
      max_applications_per_job = COALESCE($3, max_applications_per_job),
      price = COALESCE($4, price), duration_days = COALESCE($5, duration_days),
      features = COALESCE($6, features), is_active = COALESCE($7, is_active)
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

const createPayment = async (req, res) => {
  try {
    const { company_id, plan_id, amount, status, transaction_id } = req.body
    if (!company_id || !plan_id || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    const result = await db.query(
      `INSERT INTO payments (company_id, plan_id, amount, status, transaction_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [company_id, plan_id, amount, status || 'pending', transaction_id || null]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params
    const { company_id, plan_id, amount, status, transaction_id } = req.body
    const result = await db.query(
      `UPDATE payments SET
        company_id = COALESCE($1, company_id), plan_id = COALESCE($2, plan_id),
        amount = COALESCE($3, amount), status = COALESCE($4, status),
        transaction_id = COALESCE($5, transaction_id)
       WHERE id = $6 RETURNING *`,
      [company_id, plan_id, amount, status, transaction_id, id]
    )
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Payment not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' })
  }
}

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(`DELETE FROM payments WHERE id = $1 RETURNING id`, [id])
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Payment not found' })
    res.json({ success: true, message: 'Payment deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' })
  }
}

module.exports = {
  getDashboard,
  getRevenue,
  getSettings,
  updateSettings,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  toggleCompanyStatus,
  verifyCompany,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
}