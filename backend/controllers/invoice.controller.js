const Invoice = require('../models/invoice.model');
const Transaction = require('../models/transaction.model');
const Student = require('../models/student.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all invoices (Scoped)
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user_id: req.user._id });
    if (!student) return next(new AppError('Student profile not found', 404));
    query.student_id = student._id;
  } else if (req.user.role === 'admin') {
    query.hostel_id = { $in: req.user.managed_hostels };
  }

  const invoices = await Invoice.find(query).populate({
    path: 'student_id',
    populate: { path: 'user_id', select: 'name email' }
  });

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices
    }
  });
});

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private/Admin
exports.createInvoice = asyncHandler(async (req, res, next) => {
  const { student_id, title, amount, due_date, items } = req.body;

  const student = await Student.findById(student_id);
  if (!student) return next(new AppError('Student not found', 404));

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(student.hostel_id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  const invoice = await Invoice.create({
    student_id,
    hostel_id: student.hostel_id,
    title,
    amount,
    due_date,
    items
  });

  res.status(201).json({
    status: 'success',
    data: {
      invoice
    }
  });
});

// @desc    Bulk Generate Invoices (e.g. Semester Fee, Mess Bill)
// @route   POST /api/invoices/bulk
// @access  Private/Admin
exports.generateBulkInvoices = asyncHandler(async (req, res, next) => {
  const { hostel_id, title, amount, due_date, items } = req.body;

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(hostel_id)) {
    return next(new AppError('Not authorized for this hostel', 403));
  }

  // Find all active students in the hostel
  const students = await Student.find({ hostel_id, status: 'active' });

  if (students.length === 0) {
    return next(new AppError('No active students found in this hostel', 404));
  }

  const invoicesToCreate = students.map(student => ({
    student_id: student._id,
    hostel_id,
    title,
    amount,
    due_date,
    items
  }));

  const createdInvoices = await Invoice.insertMany(invoicesToCreate);

  res.status(201).json({
    status: 'success',
    results: createdInvoices.length,
    message: `Successfully generated ${createdInvoices.length} invoices.`,
    data: null
  });
});

// @desc    Simulate or Record Payment (Webhook logic)
// @route   POST /api/invoices/:id/pay
// @access  Private
exports.payInvoice = asyncHandler(async (req, res, next) => {
  const { amount_paid, payment_method, reference_id } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) return next(new AppError('Invoice not found', 404));
  
  // Scoping
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user_id: req.user._id });
    if (invoice.student_id.toString() !== student._id.toString()) {
       return next(new AppError('Not your invoice', 403));
    }
  }

  const transaction = await Transaction.create({
    invoice_id: invoice._id,
    student_id: invoice.student_id,
    amount_paid,
    payment_method,
    reference_id,
    status: 'success' // In real life, webhooks would update this from pending
  });

  invoice.status = 'paid';
  await invoice.save();

  res.status(200).json({
    status: 'success',
    data: {
      transaction,
      invoice
    }
  });
});
