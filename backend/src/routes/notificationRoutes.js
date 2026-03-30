const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', ctrl.listNotifications);
router.patch('/read-all', ctrl.markAllAsRead);
router.patch('/read/:id', ctrl.markOneAsRead);

module.exports = router;

