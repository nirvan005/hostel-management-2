const { z } = require('zod');

const createHostel = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    blocks: z.array(z.string()).optional(),
  }),
});

const createRoom = z.object({
  body: z.object({
    room_number: z.string().min(1, 'Room number is required'),
    floor: z.number().int().nonnegative('Floor must be a non-negative integer'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    amenities: z.array(z.string()).optional(),
  }),
});

const assignStudent = z.object({
  body: z.object({
    student_id: z.string().length(24, 'Invalid student ID format'),
  }),
});

module.exports = {
  createHostel,
  createRoom,
  assignStudent
};
