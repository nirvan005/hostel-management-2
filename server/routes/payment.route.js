const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
router.get("/", PaymentController.getPayments);
router.get("/student", PaymentController.getStudentPayments);
router.get("/pending", PaymentController.pendingPayments);
router.post("/mark-paid", PaymentController.markPaid);
module.exports = router;
