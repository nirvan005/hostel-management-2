const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount_paid: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cash', 'webhook'],
    required: true
  },
  reference_id: {
    type: String,
    trim: true // e.g., Stripe/Razorpay charge ID
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
