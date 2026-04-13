
const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const { uploadResume, uploadProfileFiles } = require('../../middleware/upload')
const ctrl = require('../../controllers/employee/employee.controller')
const chatHandler = require('./chat.route') // ← plain async function, not a router

router.use(auth)
router.use(requireRole('employee'))

// In your main routes/employee/index.js or app.js
router.use('/interview', require('./interview.route'))
router.get('/profile', ctrl.getProfile)
router.put('/profile', uploadProfileFiles, ctrl.updateProfile)

router.get('/jobs', ctrl.browseJobs)
router.get('/jobs/:id', ctrl.getJobDetail)

router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
router.get('/applications', ctrl.getMyApplications)


router.post('/jobs/:jobId/save', ctrl.saveJob)
router.get('/saved-jobs', ctrl.getSavedJobs)

router.get('/notifications', ctrl.getNotifications)


router.post('/chat', chatHandler)

module.exports = router