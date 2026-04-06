const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const ctrl = require('../../controllers/admin/admin.controller')

router.use(auth)
router.use(requireRole('admin'))

router.get('/dashboard', ctrl.getDashboard)

router.get('/companies', ctrl.getAllCompanies)
router.patch('/companies/:id/toggle', ctrl.toggleCompanyStatus)
router.patch('/companies/:id/verify', ctrl.verifyCompany)

router.get('/users', ctrl.getAllUsers)
router.patch('/users/:id/toggle', ctrl.toggleUserStatus)

router.get('/plans', ctrl.getSubscriptionPlans)
router.put('/plans/:id', ctrl.updateSubscriptionPlan)

router.get('/payments', ctrl.getPayments)

module.exports = router
