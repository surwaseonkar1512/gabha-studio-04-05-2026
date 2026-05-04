require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    let admin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (admin) {
      console.log('Super Admin already exists. Updating credentials...');
      admin.email = process.env.ADMIN_EMAIL || 'amarp.team@gmail.com';
      admin.password = 'password123';
      await admin.save();
      console.log('Super Admin updated successfully!');
      process.exit();
    } else {
      const superAdmin = new User({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'amarp.team@gmail.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'SUPER_ADMIN',
        permissions: {
          crm: ['view', 'add', 'edit', 'delete'],
          cms: ['view', 'add', 'edit', 'delete'],
          expenses: ['view', 'add', 'edit', 'delete'],
          dashboard: ['view'],
        }
      });
      await superAdmin.save();
      console.log('Super Admin seeded successfully!');
      process.exit();
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
