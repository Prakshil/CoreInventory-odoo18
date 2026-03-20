const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', ctrl.listUsers);
router.post('/users', ctrl.createUser);
router.patch('/users/:id', ctrl.updateUser);

router.get('/settings', ctrl.listSettings);
router.put('/settings', ctrl.upsertSettings);

router.get('/audit-logs', ctrl.listAuditLogs);

module.exports = router;

