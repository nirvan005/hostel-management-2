const express = require('express');
const studentController = require('../controllers/student.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorizeRoles('admin', 'super_admin'), studentController.getStudents);

router
  .route('/me')
  .get(studentController.getMe);

router
  .route('/:id')
  .get(studentController.getStudent);

router
  .route('/:id/assign-room')
  .post(authorizeRoles('admin', 'super_admin'), studentController.assignRoom);

module.exports = router;
