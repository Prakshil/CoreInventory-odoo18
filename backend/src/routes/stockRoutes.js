const router = require('express').Router();
const ctrl = require('../controllers/stockController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/where-is-it', authorize('ADMIN', 'MANAGER', 'VIEWER', 'STAFF'), ctrl.whereIsIt);

module.exports = router;

