const router = require('express').Router();
const ctrl = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MANAGER'), ctrl.list);
router.post('/', authorize('ADMIN', 'MANAGER'), ctrl.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), ctrl.update);
router.delete('/:id', authorize('ADMIN'), ctrl.remove);

module.exports = router;

