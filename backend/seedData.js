require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

// Models
const User = require('./models/user.model');
const Student = require('./models/student.model');
const Hostel = require('./models/hostel.model');
const Room = require('./models/room.model');
const Leave = require('./models/leave.model');
const Invoice = require('./models/invoice.model');
const Invite = require('./models/invite.model');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to Database. Clearing existing data...');

    // Clear all existing data
    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Hostel.deleteMany(),
      Room.deleteMany(),
      Leave.deleteMany(),
      Invoice.deleteMany(),
      Invite.deleteMany()
    ]);

    console.log('Seeding Hostels...');
    const hostelA = await Hostel.create({ name: 'Aravali Hostel', location: 'North Campus', type: 'Boys', capacity: 300 });
    const hostelB = await Hostel.create({ name: 'Nilgiri Hostel', location: 'South Campus', type: 'Girls', capacity: 300 });

    console.log('Seeding Chief Warden...');
    const chiefWarden = await User.create({
      name: 'Chief Warden Admin',
      email: 'chief@university.edu',
      password: await bcrypt.hash('securepassword123', 10),
      phone: '9876543210',
      role: 'super_admin'
    });

    console.log('Seeding Resident Warden for Aravali & Nilgiri...');
    const aravaliWarden = await User.create({
      name: 'Aravali Warden',
      email: 'aravali.warden@university.edu',
      password: await bcrypt.hash('securepassword123', 10),
      phone: '9876543211',
      role: 'admin',
      managed_hostels: [hostelA._id]
    });
    
    const nilgiriWarden = await User.create({
      name: 'Nilgiri Warden',
      email: 'nilgiri.warden@university.edu',
      password: await bcrypt.hash('securepassword123', 10),
      phone: '9876543212',
      role: 'admin',
      managed_hostels: [hostelB._id]
    });

    console.log('Seeding Rooms for Aravali (3 floors, 15 rooms each)...');
    const aravaliRooms = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let r = 1; r <= 15; r++) {
        const roomNumber = `${floor}${r.toString().padStart(2, '0')}`;
        // Randomly assign capacity 1 or 2
        const capacity = Math.random() > 0.5 ? 2 : 1;
        // Randomly set some rooms to maintenance
        const status = Math.random() > 0.9 ? 'maintenance' : 'vacant';
        const room = await Room.create({
          hostel_id: hostelA._id,
          room_number: roomNumber,
          floor: floor,
          capacity: capacity,
          status: status
        });
        aravaliRooms.push(room);
      }
    }

    console.log('Seeding Students & Allocating them to Aravali rooms...');
    const students = [];
    let roomIndex = 0;
    const defaultPassword = await bcrypt.hash('password123', 10);

    for (let i = 1; i <= 40; i++) {
      // Find a vacant room
      let assignedRoom = null;
      while (roomIndex < aravaliRooms.length) {
        if (aravaliRooms[roomIndex].status !== 'maintenance' && aravaliRooms[roomIndex].occupants.length < aravaliRooms[roomIndex].capacity) {
          assignedRoom = aravaliRooms[roomIndex];
          break;
        }
        roomIndex++;
      }

      const user = await User.create({
        name: `Student ${i}`,
        email: `student${i}@student.edu`,
        password: defaultPassword,
        phone: `12345678${i.toString().padStart(2, '0')}`,
        university_id: `CS2023-${i.toString().padStart(3, '0')}`,
        role: 'student'
      });

      const student = await Student.create({
        user_id: user._id,
        hostel_id: hostelA._id,
        room_id: assignedRoom ? assignedRoom._id : null,
        status: 'active'
      });

      if (assignedRoom) {
        assignedRoom.occupants.push(student._id);
        assignedRoom.status = 'occupied'; // Doesn't perfectly account for partially occupied but fits for UI dummy data
        await assignedRoom.save();
      }
      
      students.push(student);
    }

    console.log('Seeding Leaves (Randomized)...');
    const statuses = ['pending', 'approved', 'rejected', 'completed'];
    for (let i = 0; i < 15; i++) {
      const randStudent = students[Math.floor(Math.random() * students.length)];
      const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
      await Leave.create({
        student_id: randStudent._id,
        hostel_id: hostelA._id,
        leave_type: Math.random() > 0.5 ? 'Home' : 'Local',
        reason: 'Personal reasons',
        start_date: new Date(Date.now() + (Math.random() * 86400000 * 5)), // Next 5 days
        end_date: new Date(Date.now() + (Math.random() * 86400000 * 10) + 86400000 * 5),
        status: randStatus
      });
    }

    console.log('Seeding Invoices (Randomized)...');
    const invoiceStatuses = ['pending', 'paid', 'overdue'];
    for (let i = 0; i < 20; i++) {
      const randStudent = students[Math.floor(Math.random() * students.length)];
      const randStatus = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
      await Invoice.create({
        student_id: randStudent._id,
        hostel_id: hostelA._id,
        amount: Math.floor(Math.random() * 10000) + 5000,
        due_date: new Date(Date.now() + (Math.random() > 0.5 ? 1 : -1) * 86400000 * 10), // Random past or future
        status: randStatus,
        title: Math.random() > 0.5 ? 'Fall Semester Hostel Fee' : 'Mess Bill'
      });
    }

    console.log('----------------------------------------------------');
    console.log('Database successfully seeded with SCALED data!');
    console.log('Chief Warden Login: chief@university.edu / securepassword123');
    console.log('Resident Warden Login (Aravali): aravali.warden@university.edu / securepassword123');
    console.log('Student Login: student1@student.edu / password123');
    console.log('----------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
