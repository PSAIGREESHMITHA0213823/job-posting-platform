const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const { uploadResume } = require('../../middleware/upload')
const ctrl = require('../../controllers/employee/employee.controller')

router.use(auth)
router.use(requireRole('employee'))

router.get('/profile', ctrl.getProfile)
router.put('/profile', uploadResume.single('resume'), ctrl.updateProfile)

router.get('/jobs', ctrl.browseJobs)
router.get('/jobs/:id', ctrl.getJobDetail)

router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
router.get('/applications', ctrl.getMyApplications)

router.post('/jobs/:jobId/save', ctrl.saveJob)
router.get('/saved-jobs', ctrl.getSavedJobs)

router.get('/notifications', ctrl.getNotifications)

module.exports = router
