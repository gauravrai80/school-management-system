const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    console.log('Cleared existing data...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.com',
      password: 'password123',
      role: 'admin',
      phone: '1111111111'
    });

    const teacherUser = await User.create({
      name: 'Teacher User',
      email: 'teacher@school.com',
      password: 'password123',
      role: 'teacher',
      phone: '2222222222'
    });
    
    await Teacher.create({
      userId: teacherUser._id,
      employeeId: 'T-001',
      subjects: ['Physics', 'Science'],
      classes: ['10A', '10B'],
      qualification: 'M.Sc Physics',
      experience: 5,
      department: 'Science',
      salary: 50000
    });

    const parentUser = await User.create({
      name: 'Parent User',
      email: 'parent@school.com',
      password: 'password123',
      role: 'parent',
      phone: '3333333333'
    });

    const studentUser = await User.create({
      name: 'Student User',
      email: 'student@school.com',
      password: 'password123',
      role: 'student',
      phone: '4444444444'
    });

    await Student.create({
      userId: studentUser._id,
      rollNumber: 'S-001',
      class: '10A',
      section: 'A',
      dateOfBirth: new Date('2005-01-01'),
      gender: 'male',
      address: '456 Student Ave',
      parentName: 'Parent User',
      parentPhone: '3333333333',
      parentEmail: 'parent@school.com',
      admissionDate: new Date(),
      feeStatus: 'paid'
    });

    console.log('Seed data inserted successfully!');
    console.log(`
    Credentials:
    Admin: admin@school.com / password123
    Teacher: teacher@school.com / password123
    Student: student@school.com / password123
    Parent: parent@school.com / password123
    `);
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
