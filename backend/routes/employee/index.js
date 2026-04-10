// // // const router = require('express').Router()
// // // const { auth, requireRole } = require('../../middleware/auth')
// // // const { uploadResume } = require('../../middleware/upload')
// // // const ctrl = require('../../controllers/employee/employee.controller')

// // // router.use(auth)
// // // router.use(requireRole('employee'))

// // // router.get('/profile', ctrl.getProfile)
// // // router.put('/profile', uploadResume.single('resume'), ctrl.updateProfile)

// // // router.get('/jobs', ctrl.browseJobs)
// // // router.get('/jobs/:id', ctrl.getJobDetail)

// // // router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
// // // router.get('/applications', ctrl.getMyApplications)

// // // router.post('/jobs/:jobId/save', ctrl.saveJob)
// // // router.get('/saved-jobs', ctrl.getSavedJobs)

// // // router.get('/notifications', ctrl.getNotifications)

// // // module.exports = router
// // const router = require('express').Router()
// // const { auth, requireRole } = require('../../middleware/auth')
// // const { uploadResume } = require('../../middleware/upload')
// // const ctrl = require('../../controllers/employee/employee.controller')

// // router.use(auth)
// // router.use(requireRole('employee'))

// // router.get('/profile', ctrl.getProfile)
// // router.put('/profile', uploadResume.single('resume'), ctrl.updateProfile)

// // router.get('/jobs', ctrl.browseJobs)
// // router.get('/jobs/:id', ctrl.getJobDetail)

// // router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
// // router.get('/applications', ctrl.getMyApplications)

// // router.post('/jobs/:jobId/save', ctrl.saveJob)
// // router.get('/saved-jobs', ctrl.getSavedJobs)

// // router.get('/notifications', ctrl.getNotifications)

// // module.exports = router
// const router = require('express').Router()
// const { auth, requireRole } = require('../../middleware/auth')
// const { uploadResume, uploadProfileFiles } = require('../../middleware/upload');
// const ctrl = require('../../controllers/employee/employee.controller')

// router.use(auth)
// router.use(requireRole('employee'))

// router.get('/profile', ctrl.getProfile)
// // router.put('/profile', uploadResume.single('resume'), ctrl.updateProfile)
// // This now uses the .fields() configuration you exported
// router.put('/profile', uploadProfileFiles, ctrl.updateProfile)

// router.get('/jobs', ctrl.browseJobs)
// router.get('/jobs/:id', ctrl.getJobDetail)

// router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
// router.get('/applications', ctrl.getMyApplications)

// router.post('/jobs/:jobId/save', ctrl.saveJob)
// router.get('/saved-jobs', ctrl.getSavedJobs)

// router.get('/notifications', ctrl.getNotifications)

// module.exports = router
// const router = require('express').Router()
// const { auth, requireRole } = require('../../middleware/auth')
// const { uploadResume, uploadProfileFiles } = require('../../middleware/upload');
// const ctrl = require('../../controllers/employee/employee.controller')

// router.use(auth)
// router.use(requireRole('employee'))

// router.get('/profile', ctrl.getProfile)
// // router.put('/profile', uploadResume.single('resume'), ctrl.updateProfile)
// // This now uses the .fields() configuration you exported
// router.put('/profile', uploadProfileFiles, ctrl.updateProfile)

// router.get('/jobs', ctrl.browseJobs)
// router.get('/jobs/:id', ctrl.getJobDetail)

// router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
// router.get('/applications', ctrl.getMyApplications)

// router.post('/jobs/:jobId/save', ctrl.saveJob)
// router.get('/saved-jobs', ctrl.getSavedJobs)

// router.get('/notifications', ctrl.getNotifications)

// module.exports = router
const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const { uploadResume, uploadProfileFiles } = require('../../middleware/upload')
const ctrl = require('../../controllers/employee/employee.controller')
const chatHandler = require('./chat.route') // ← plain async function, not a router

router.use(auth)
router.use(requireRole('employee'))

// Profile
router.get('/profile', ctrl.getProfile)
router.put('/profile', uploadProfileFiles, ctrl.updateProfile)

// Jobs
router.get('/jobs', ctrl.browseJobs)
router.get('/jobs/:id', ctrl.getJobDetail)

// Applications
router.post('/apply', uploadResume.single('resume'), ctrl.applyToJob)
router.get('/applications', ctrl.getMyApplications)

// Saved jobs
router.post('/jobs/:jobId/save', ctrl.saveJob)
router.get('/saved-jobs', ctrl.getSavedJobs)

// Notifications
router.get('/notifications', ctrl.getNotifications)

// ✅ AI Chatbot
router.post('/chat', chatHandler)

module.exports = router