const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin', 'super_admin')); // Only staff can see dashboard stats

router.get('/', dashboardController.getStats);

module.exports = router;
