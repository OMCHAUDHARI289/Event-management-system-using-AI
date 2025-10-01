const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.log(err));

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if(adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@icem.edu',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created:', admin.email);
    process.exit();
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
};

seedAdmin();
