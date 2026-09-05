const { z } = require('zod');

const createInvoice = z.object({
  body: z.object({
    student_id: z.string().length(24, 'Invalid student ID format'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    amount: z.number().positive('Amount must be positive'),
    due_date: z.string().datetime('Invalid due date (must be ISO 8601 string)'),
    items: z.array(
      z.object({
        description: z.string(),
        amount: z.number().positive()
      })
    ).optional(),
  }),
});

const recordPayment = z.object({
  body: z.object({
    amount_paid: z.number().positive('Amount must be positive'),
    payment_method: z.enum(['card', 'upi', 'netbanking', 'cash']),
    reference_id: z.string().optional(),
  }),
});

module.exports = {
  createInvoice,
  recordPayment
};
