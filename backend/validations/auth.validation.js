const { z } = require('zod');

const login = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const registerStudent = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    university_id: z.string().min(1, 'University ID is required'),
  }),
});

const registerAdmin = z.object({
  body: z.object({
    token: z.string().min(1, 'Invite token is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
  }),
});

module.exports = {
  login,
  registerStudent,
  registerAdmin,
};
