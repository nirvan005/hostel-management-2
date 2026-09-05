const express = require('express');
const hostelController = require('../controllers/hostel.controller');
const { protect, authorizeRoles, scopeToHostel } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const hostelValidation = require('../validations/hostel.validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(scopeToHostel, hostelController.getAllHostels)
  .post(
    authorizeRoles('super_admin'),
    validate(hostelValidation.createHostel),
    hostelController.createHostel
  );

router
  .route('/:id')
  .get(scopeToHostel, hostelController.getHostel);

module.exports = router;
