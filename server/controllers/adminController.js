const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../config/email');
const Event = require('../models/Event');

// Get all students (role: student)
async function getAllStudents(req, res) {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get all club members (role: clubMember)
async function getAllClubMembers(req, res) {
  try {
    const members = await User.find({ role: 'clubMember' }).select('-password');
    res.status(200).json({ members });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Add new club member directly (admin adds)
async function addClubMember(req, res) {
  try {
    const { name, email, password, role, prn, phone, branch, year, position } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email and Password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const allowedRoles = ['student', 'clubMember'];
    const normalizedRole = role === 'club' ? 'clubMember' : role;
    const finalRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'clubMember';

    const newMember = new User({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      prn,
      phone,
      branch,
      year,
      position: finalRole === 'clubMember' ? (position || 'Member') : undefined,
    });

    await newMember.save();

    // Send email to new user
    const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/login` : 'http://localhost:5173/auth/login';
    const htmlContent = finalRole === 'clubMember'
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:10px; text-align:center;">
        <h2 style=\"color:#4B0082;\">Welcome, ${name}!</h2>
        <p style=\"color:#333; font-size:16px;\">You have been added as a Club Member.</p>
        <a href=\"${loginUrl}\" style=\"display:inline-block; margin-top:20px; background: linear-gradient(90deg,#4B0082,#8A2BE2); color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;\">Go to Login</a>
      </div>`
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:10px; text-align:center;">
        <h2 style=\"color:#4B0082;\">Welcome, ${name}!</h2>
        <p style=\"color:#333; font-size:16px;\">Your student account has been created.</p>
        <a href=\"${loginUrl}\" style=\"display:inline-block; margin-top:20px; background: linear-gradient(90deg,#4B0082,#8A2BE2); color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;\">Go to Login</a>
      </div>`;
    await sendEmail(email, finalRole === 'clubMember' ? 'Welcome to the Club!' : 'Welcome to ICEM Events!', htmlContent, true);

    res.status(201).json({ message: 'Club member added successfully', user: newMember });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Promote student to club member
async function promoteToClubMember(req, res) {
  try {
    const { position, branch, year } = req.body;
    const userId = req.params.id || req.body.userId;

    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.role !== 'student') return res.status(400).json({ message: 'User is not a student' });

    student.role = 'clubMember';
    if (position) student.position = position;
    if (branch) student.branch = branch;
    if (year) student.year = year;

    await student.save();

    // Send promotion email
    await sendEmail(
      student.email,
      'Congratulations! You are now a Club Member',
      `Hi ${student.name},\n\nYou have been promoted to a Club Member by Admin.\nEnjoy your new privileges!`
    );

    res.status(200).json({ message: 'Student promoted to club member', user: student });
  } catch (error) {
    console.error('Promote error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Delete club member
async function deleteClubMember(req, res) {
  try {
    const { id } = req.params;

    const member = await User.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.role !== 'clubMember') return res.status(400).json({ message: 'User is not a club member' });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Club member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get admin/user profile by id
async function getProfile(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Update admin/user profile by id
async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const allowedFields = ['name', 'email', 'phone', 'branch', 'year', 'position', 'department', 'location', 'bio'];
    const updates = {};
    for (const key of allowedFields) {
      if (key in req.body) updates[key] = req.body[key];
    }
    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Basic analytics metrics for Admin Analytics page
async function getAnalytics(req, res) {
  try {
    const [totalEvents, totalUsers, totalStudents, totalClubMembers] = await Promise.all([
      Event.countDocuments({}),
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'clubMember' })
    ]);

    // Aggregate events and registrations per month for last 6 months
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    const events = await Event.find({ createdAt: { $gte: since } }).select('createdAt registrations');
    const monthly = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = { month: key, events: 0, registrations: 0 };
    }
    for (const e of events) {
      const key = `${e.createdAt.getFullYear()}-${String(e.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { month: key, events: 0, registrations: 0 };
      monthly[key].events += 1;
      monthly[key].registrations += Number(e.registrations || 0);
    }
    const monthlySeries = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      summary: {
        totalEvents,
        totalUsers,
        totalStudents,
        totalClubMembers
      },
      monthly: monthlySeries
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = {
  getAllStudents,
  getAllClubMembers,
  addClubMember,
  promoteToClubMember,
  deleteClubMember,
  // Return high-level admin stats for dashboard
  async getAdminStats(req, res) {
    try {
      const [totalUsers, totalStudents, totalClubMembers, totalEvents, upcomingEvents] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'clubMember' }),
        Event.countDocuments({}),
        Event.countDocuments({ status: 'upcoming' })
      ]);

      res.status(200).json({
        users: {
          total: totalUsers,
          students: totalStudents,
          clubMembers: totalClubMembers
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents
        }
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
  ,
  getProfile,
  updateProfile,
  getAnalytics
};
