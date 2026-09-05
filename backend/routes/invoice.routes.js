const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorizeRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const invoiceValidation = require('../validations/invoice.validation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(invoiceController.getInvoices)
  .post(
    authorizeRoles('admin', 'super_admin'),
    validate(invoiceValidation.createInvoice),
    invoiceController.createInvoice
  );

router
  .route('/bulk')
  .post(
    authorizeRoles('admin', 'super_admin'),
    invoiceController.generateBulkInvoices
  );

router
  .route('/:id/pay')
  .post(
    validate(invoiceValidation.recordPayment),
    invoiceController.payInvoice
  );

module.exports = router;
