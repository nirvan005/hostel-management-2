require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const connectDB = require('../config/db');

async function setupRootAdmin() {
  await connectDB();

  try {
    const rootEmail = process.env.ROOT_ADMIN_EMAIL || 'chief@university.edu';
    const rootPassword = process.env.ROOT_ADMIN_PASSWORD || 'securepassword123';
    
    // Check if super_admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rootPassword, salt);

    const superAdmin = new User({
      name: 'Chief Warden',
      email: rootEmail,
      password: hashedPassword,
      phone: '1234567890',
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log(`Successfully created root Super Admin with email: ${rootEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup root admin:', error);
    process.exit(1);
  }
}

setupRootAdmin();
