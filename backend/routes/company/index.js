const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const { uploadLogo } = require('../../middleware/upload')
const ctrl = require('../../controllers/company/company.controller')

router.use(auth)
router.use(requireRole('company_manager'))

router.get('/dashboard', ctrl.getDashboard)
router.get('/profile', ctrl.getCompanyProfile)
router.put('/profile', uploadLogo.single('logo'), ctrl.updateCompanyProfile)

router.get('/jobs', ctrl.getMyJobs)
router.post('/jobs', ctrl.createJob)
router.put('/jobs/:id', ctrl.updateJob)
router.delete('/jobs/:id', ctrl.deleteJob)

router.get('/jobs/:jobId/applicants', ctrl.getJobApplicants)
router.patch('/applications/:appId/status', ctrl.updateApplicationStatus)

module.exports = router
