const express = require('express')
const router  = express.Router()
const { v4: uuidv4 } = require('uuid')
const featuresToJson = (features) => {
  const obj = {}
  if (!features) return obj
  features.split('\n').filter(Boolean).forEach(f => {
    const key = f.trim().toLowerCase().replace(/\s+/g, '_')
    obj[key] = true
  })
  return obj
}
router.get('/', async (req, res) => {
  try {
    const result = await req.pool.query(
      'SELECT * FROM subscription_plans ORDER BY price ASC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET /plans error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})
router.post('/', async (req, res) => {
  try {
    const {
      name,
      price,
      duration_days,
      features,
      max_job_postings         = 10,
      max_applications_per_job = 100,
    } = req.body

    if (!name || price === undefined || !duration_days) {
      return res.status(400).json({
        success: false,
        message: 'name, price, and duration_days are required.'
      })
    }

    const id         = uuidv4()
    const featuresJson = JSON.stringify(featuresToJson(features))
    const created_at = new Date().toISOString()

    const result = await req.pool.query(
      `INSERT INTO subscription_plans
        (id, name, price, duration_days, features, max_job_postings, max_applications_per_job, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        id,
        name.trim(),
        parseFloat(price),
        parseInt(duration_days, 10),
        featuresJson,
        parseInt(max_job_postings, 10),
        parseInt(max_applications_per_job, 10),
        true,
        created_at,
      ]
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('POST /plans error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const check = await req.pool.query(
      'SELECT id FROM subscription_plans WHERE id = $1', [id]
    )
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found.' })
    }

    const {
      name,
      price,
      duration_days,
      features,
      max_job_postings,
      max_applications_per_job,
      is_active,
    } = req.body
    const fields = []
    const values = []
    let idx = 1

    if (name !== undefined)                     { fields.push(`name = $${idx++}`);                     values.push(name.trim()) }
    if (price !== undefined)                    { fields.push(`price = $${idx++}`);                    values.push(parseFloat(price)) }
    if (duration_days !== undefined)            { fields.push(`duration_days = $${idx++}`);            values.push(parseInt(duration_days, 10)) }
    if (features !== undefined)                 { fields.push(`features = $${idx++}`);                 values.push(JSON.stringify(featuresToJson(features))) }
    if (max_job_postings !== undefined)         { fields.push(`max_job_postings = $${idx++}`);         values.push(parseInt(max_job_postings, 10)) }
    if (max_applications_per_job !== undefined) { fields.push(`max_applications_per_job = $${idx++}`); values.push(parseInt(max_applications_per_job, 10)) }
    if (is_active !== undefined)                { fields.push(`is_active = $${idx++}`);                values.push(is_active) }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' })
    }

    values.push(id)
    const result = await req.pool.query(
      `UPDATE subscription_plans SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('PUT /plans/:id error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const check = await req.pool.query(
      'SELECT id FROM subscription_plans WHERE id = $1', [id]
    )
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found.' })
    }

    await req.pool.query('DELETE FROM subscription_plans WHERE id = $1', [id])
    res.json({ success: true, message: 'Plan deleted.' })
  } catch (err) {
    console.error('DELETE /plans/:id error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router