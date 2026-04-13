const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const { uploadResume } = require('../../middleware/upload')
const ctrl = require('../../controllers/employee/interview.controller')

router.use(auth)
router.use(requireRole('employee'))

router.post('/start', uploadResume.single('resume'), ctrl.startInterview)
router.post('/answer', ctrl.submitAnswer)
router.post('/finish', ctrl.finishInterview)
router.get('/sessions', ctrl.getInterviewSessions)
router.get('/sessions/:id', ctrl.getInterviewSession)

module.exports = router