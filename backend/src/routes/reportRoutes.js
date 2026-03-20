const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);

// Viewer-focused reports (read-only exports)
router.get('/low-stock.csv', authorize('ADMIN', 'MANAGER', 'VIEWER'), ctrl.lowStockCsv);
router.get('/stock-summary.csv', authorize('ADMIN', 'MANAGER', 'VIEWER'), ctrl.stockSummaryCsv);

// Manager+ forecasting
router.get('/reorder-recommendations', authorize('ADMIN', 'MANAGER'), ctrl.reorderRecommendations);

module.exports = router;

