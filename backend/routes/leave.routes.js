const express = require('express');
const leaveController = require('../controllers/leave.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const leaveValidation = require('../validations/leave.validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(leaveController.getLeaves)
  .post(
    authorizeRoles('student'), 
    validate(leaveValidation.applyLeave), 
    leaveController.applyLeave
  );

router
  .route('/:id/status')
  .patch(
    authorizeRoles('admin', 'super_admin'),
    validate(leaveValidation.updateLeaveStatus),
    leaveController.updateLeaveStatus
  );

router
  .route('/:id/gate')
  .patch(
    authorizeRoles('admin', 'super_admin'),
    leaveController.markGateMovement
  );

module.exports = router;
