const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

router.post("/signup-admin", AuthController.signupAdmin);
router.post("/login-admin", AuthController.loginAdmin);
router.post("/signup-student", AuthController.signupStudent);
router.post("/login-student", AuthController.loginStudent);

module.exports = router;
