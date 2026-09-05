const express = require('express');
const inviteController = require('../controllers/invite.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('super_admin')); // Only chief warden can invite others

router
  .route('/')
  .get(inviteController.getInvites)
  .post(inviteController.createInvite);

module.exports = router;
