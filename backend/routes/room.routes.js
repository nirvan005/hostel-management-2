const express = require('express');
const roomController = require('../controllers/room.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const hostelValidation = require('../validations/hostel.validation');

// mergeParams: true allows us to access :hostelId from the nested router
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(roomController.getRooms)
  .post(
    authorizeRoles('super_admin'),
    validate(hostelValidation.createRoom),
    roomController.createRoom
  );

router
  .route('/:id')
  .patch(authorizeRoles('admin', 'super_admin'), roomController.updateRoomStatus);

module.exports = router;
