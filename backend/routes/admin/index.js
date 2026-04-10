
const router = require('express').Router()
const { auth, requireRole } = require('../../middleware/auth')
const ctrl = require('../../controllers/admin/admin.controller')
const profileRoutes = require('./profile')
const plansRoutes   = require('./plans')

// Profile 
router.use('/profile', profileRoutes)

// All routes below require auth + admin role
router.use(auth)
router.use(requireRole('admin'))

// Dashboard
router.get('/dashboard', ctrl.getDashboard)

// Revenue
router.get('/revenue', ctrl.getRevenue)

// Settings
router.get('/settings', ctrl.getSettings)
router.put('/settings',  ctrl.updateSettings)

// Companies
router.get('/companies',              ctrl.getAllCompanies)
router.post('/companies',             ctrl.createCompany)
router.put('/companies/:id',          ctrl.updateCompany)
router.delete('/companies/:id',       ctrl.deleteCompany)
router.patch('/companies/:id/toggle', ctrl.toggleCompanyStatus)
router.patch('/companies/:id/verify', ctrl.verifyCompany)

// Users
router.get('/users',              ctrl.getAllUsers)
router.post('/users',             ctrl.createUser)
router.put('/users/:id',          ctrl.updateUser)
router.delete('/users/:id',       ctrl.deleteUser)
router.patch('/users/:id/toggle', ctrl.toggleUserStatus)
router.use('/plans', plansRoutes)


router.get('/payments',        ctrl.getPayments)
router.post('/payments',       ctrl.createPayment)
router.put('/payments/:id',    ctrl.updatePayment)
router.delete('/payments/:id', ctrl.deletePayment)

module.exports = router