const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');

const router = express.Router();

router.post('/login', validate(authValidation.login), authController.login);
router.post('/register-student', validate(authValidation.registerStudent), authController.registerStudent);
router.post('/register-admin', validate(authValidation.registerAdmin), authController.registerAdmin);
router.get('/logout', authController.logout);

// Protected routes below
router.use(protect);
router.get('/me', authController.getMe);

module.exports = router;
