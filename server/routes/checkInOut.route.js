const express = require("express");
const router = express.Router();
const checkInOutController = require("../controllers/checkInOut.controller");

router.get("/", checkInOutController.getCheckInOut);
module.exports = router;
