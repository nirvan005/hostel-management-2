const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");

router.get("/", AdminController.getAdmin);
module.exports = router;
