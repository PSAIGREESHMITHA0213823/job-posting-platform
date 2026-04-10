
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
    const plans = await req.db('subscription_plans')
      .select('*')
      .orderBy('price', 'asc')
    res.json({ success: true, data: plans })
  } catch (err) {
    console.error('GET /plans error:', err)
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
      max_job_postings        = 10,
      max_applications_per_job = 100,
    } = req.body

    if (!name || price === undefined || !duration_days) {
      return res.status(400).json({
        success: false,
        message: 'name, price, and duration_days are required.'
      })
    }

    const plan = {
      id:                       uuidv4(),
      name:                     name.trim(),
      price:                    parseFloat(price),
      duration_days:            parseInt(duration_days, 10),
      features:                 JSON.stringify(featuresToJson(features)),
      max_job_postings:         parseInt(max_job_postings, 10),
      max_applications_per_job: parseInt(max_applications_per_job, 10),
      is_active:                true,
      created_at:               new Date().toISOString(),
    }

    await req.db('subscription_plans').insert(plan)
    res.json({ success: true, data: plan })
  } catch (err) {
    console.error('POST /plans error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      price,
      duration_days,
      features,
      max_job_postings,
      max_applications_per_job,
      is_active,
    } = req.body

    const existing = await req.db('subscription_plans').where({ id }).first()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Plan not found.' })
    }

    const updates = {}
    if (name !== undefined)                     updates.name = name.trim()
    if (price !== undefined)                    updates.price = parseFloat(price)
    if (duration_days !== undefined)            updates.duration_days = parseInt(duration_days, 10)
    if (features !== undefined)                 updates.features = JSON.stringify(featuresToJson(features))
    if (max_job_postings !== undefined)         updates.max_job_postings = parseInt(max_job_postings, 10)
    if (max_applications_per_job !== undefined) updates.max_applications_per_job = parseInt(max_applications_per_job, 10)
    if (is_active !== undefined)                updates.is_active = is_active

    await req.db('subscription_plans').where({ id }).update(updates)
    const updated = await req.db('subscription_plans').where({ id }).first()
    res.json({ success: true, data: updated })
  } catch (err) {
    console.error('PUT /plans/:id error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await req.db('subscription_plans').where({ id }).first()
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Plan not found.' })
    }
    await req.db('subscription_plans').where({ id }).delete()
    res.json({ success: true, message: 'Plan deleted.' })
  } catch (err) {
    console.error('DELETE /plans/:id error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router