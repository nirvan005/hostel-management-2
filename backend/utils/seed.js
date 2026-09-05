require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Hostel = require('../models/hostel.model');
const Room = require('../models/room.model');
const Student = require('../models/student.model');
const Leave = require('../models/leave.model');
const Invoice = require('../models/invoice.model');
const User = require('../models/user.model');

async function seedData() {
  await connectDB();

  try {
    // Clear existing
    await Hostel.deleteMany({});
    await Room.deleteMany({});
    await Student.deleteMany({});
    await Leave.deleteMany({});
    await Invoice.deleteMany({});
    await User.deleteMany({ role: 'student' });
    
    // Drop lingering indexes if any
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
    } catch(err) {}


    // Create Hostels
    const hostelA = await Hostel.create({
      name: 'Kingsley Hall',
      capacity: 500,
      blocks: ['A', 'B']
    });

    const hostelB = await Hostel.create({
      name: 'Queens Manor',
      capacity: 300,
      blocks: ['East', 'West']
    });

    // Create Rooms for Kingsley Hall Block A
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
      rooms.push({
        hostel_id: hostelA._id,
        room_number: `A-${100 + i}`,
        floor: 1,
        capacity: 2,
        status: i <= 5 ? 'occupied' : 'vacant',
        amenities: ['AC', 'Attached Washroom']
      });
    }
    const insertedRooms = await Room.insertMany(rooms);

    // Create Students
    const studentsData = [
      {
        name: 'Aarav Gupta',
        email: 'aarav.gupta@univ.edu',
        password: 'password123',
        phone: '+91 98765 43210',
        university_id: '2024CS001',
        course: 'B.Tech Computer Science',
        year: 2,
        emergency_contact: {
          name: 'Rajesh Gupta',
          relation: 'Father',
          phone: '+91 98765 43211'
        },
        hostel_id: hostelA._id,
        room_id: insertedRooms[0]._id
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@univ.edu',
        password: 'password123',
        phone: '+91 98765 43212',
        university_id: '2024EC042',
        course: 'B.Tech Electronics',
        year: 2,
        emergency_contact: {
          name: 'Anita Sharma',
          relation: 'Mother',
          phone: '+91 98765 43213'
        },
        hostel_id: hostelA._id,
        room_id: insertedRooms[1]._id
      },
      {
        name: 'Rohan Kumar',
        email: 'rohan.k@univ.edu',
        password: 'password123',
        phone: '+91 98765 43214',
        university_id: '2024ME015',
        course: 'B.Tech Mechanical',
        year: 1,
        emergency_contact: {
          name: 'Vikram Kumar',
          relation: 'Father',
          phone: '+91 98765 43215'
        },
        hostel_id: hostelA._id,
        room_id: insertedRooms[2]._id
      }
    ];

    const createdStudents = [];
    for (const data of studentsData) {
      // Create user first
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'student',
        phone: data.phone,
        university_id: data.university_id
      });
      
      const student = await Student.create({
        user_id: user._id,
        university_id: data.university_id,
        course: data.course,
        year: data.year,
        emergency_contact: data.emergency_contact,
        hostel_id: data.hostel_id,
        room_id: data.room_id
      });

      // Update room occupants
      await Room.findByIdAndUpdate(data.room_id, {
        $push: { occupants: student._id }
      });

      createdStudents.push(student);
    }

    // Create Leaves
    await Leave.create([
      {
        student_id: createdStudents[0]._id,
        hostel_id: hostelA._id,
        leave_type: 'out-pass',
        reason: 'Going to local market',
        start_date: new Date(),
        end_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        status: 'pending'
      },
      {
        student_id: createdStudents[1]._id,
        hostel_id: hostelA._id,
        leave_type: 'home-visit',
        reason: 'Diwali holidays',
        start_date: new Date(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        status: 'active' // Already approved and left
      }
    ]);

    // Create Invoices
    await Invoice.create([
      {
        student_id: createdStudents[0]._id,
        hostel_id: hostelA._id,
        title: 'Fall Semester Hostel Fee',
        amount: 45000,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        type: 'fee'
      },
      {
        student_id: createdStudents[2]._id,
        hostel_id: hostelA._id,
        title: 'Library Fine',
        amount: 500,
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        status: 'pending',
        type: 'fine'
      },
      {
        student_id: createdStudents[1]._id,
        hostel_id: hostelA._id,
        title: 'Mess Fee - Oct',
        amount: 4500,
        due_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'paid',
        type: 'mess'
      }
    ]);

    console.log('Successfully seeded hostels, rooms, students, leaves, and invoices!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedData();
