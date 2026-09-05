const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/remind', authorizeRoles('admin', 'super_admin'), notificationController.sendReminder);

module.exports = router;
