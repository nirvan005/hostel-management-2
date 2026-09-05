const { z } = require('zod');

const applyLeave = z.object({
  body: z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters long'),
    start_date: z.string().datetime('Invalid start date (must be ISO 8601 string)'),
    end_date: z.string().datetime('Invalid end date (must be ISO 8601 string)'),
  }),
});

const updateLeaveStatus = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      errorMap: () => ({ message: 'Status must be approved or rejected' })
    }),
  }),
});

module.exports = {
  applyLeave,
  updateLeaveStatus
};
