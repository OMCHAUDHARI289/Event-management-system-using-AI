const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const bcrypt = require('bcryptjs');
const sendEmail = require('../config/email');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// ======================== USERS / MEMBERS ========================

// Get all students
async function getAllStudents(req, res) {
  try {
    // Fetch all users with role 'student'
    const students = await User.find({ role: 'student' }).select('name email prn department phone');

    // Map students to include eventsAttended
    const result = await Promise.all(
      students.map(async (student) => {
        const attendedCount = await Registration.countDocuments({ userId: student._id, attended: true });
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          prn: student.prn || '',
          branch: student.department || '',
          phone: student.phone || '',
          eventsAttended: attendedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: result.length,
      students: result,
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all club members - FIXED to return flat array
// Get all club members with optional flexible filters
async function getAllClubMembers(req, res) {
  try {
    const { department, position, year, branch } = req.query;

    // Base query: only club members
    const query = { role: 'clubMember' };

    // Add optional filters (case-insensitive)
    if (department) query.department = { $regex: `^${department}$`, $options: 'i' };
    if (position) query.position = { $regex: `^${position}$`, $options: 'i' };
    if (year) query.year = year;
    if (branch) query.branch = { $regex: `^${branch}$`, $options: 'i' };

    // Fetch members
    const members = await User.find(query).select('-password');

    // Normalize missing positions
    const normalizedMembers = members.map(m => ({
      ...m.toObject(),
      position: m.position || 'Member',
      department: m.department || '',
      branch: m.branch || '',
      year: m.year || ''
    }));

    res.status(200).json({
      success: true,
      total: normalizedMembers.length,
      members: normalizedMembers
    });
  } catch (err) {
    console.error('Get club members error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}


// Add a new club member/student
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

    const newUser = new User({
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

    await newUser.save();

    // Send welcome email
    const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/login` : 'http://localhost:5173/auth/login';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:10px;text-align:center;">
        <h2 style="color:#4B0082;">Welcome, ${name}!</h2>
        <p style="color:#333;font-size:16px;">${finalRole === 'clubMember' ? 'You have been added as a Club Member.' : 'Your student account has been created.'}</p>
        <a href="${loginUrl}" style="display:inline-block;margin-top:20px;background:linear-gradient(90deg,#4B0082,#8A2BE2);color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-weight:bold;">Go to Login</a>
      </div>
    `;
    await sendEmail(email, finalRole === 'clubMember' ? 'Welcome to the Club!' : 'Welcome to ICEM Events!', htmlContent, true);

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Promote a student to club member
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

// Demote a club member to student
async function demoteClubMember(req, res) {
  try {
    const { id } = req.params;

    const member = await User.findById(id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    if (member.role !== 'clubMember') return res.status(400).json({ message: "User is not a club member" });

    // Demote by changing role to student
    member.role = 'student';
    member.position = undefined; // remove club-specific fields
    await member.save();

    res.status(200).json({ message: "Member demoted successfully", user: member });
  } catch (err) {
    console.error("Error in demoting member:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Delete a club member
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

// Delete student or club member
async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    const student = await User.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.role !== 'student') return res.status(400).json({ message: 'User is not a student' });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get profile
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

// Update profile
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

// ======================== EVENTS ========================

// Get all events
async function getEvents(req, res) {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}

// Get event by ID
async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Fetch registrations for a single event
async function getEventRegistrations (req, res) {
  try {
    const { eventId } = req.params;
    // registration documents store the event reference in `eventId` (not `event`)
    const registrations = await Registration.find({ eventId }).sort({ createdAt: -1 });
    // optionally populate user details if needed: .populate('userId', '-password')
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
};

// Create event
async function createEvent(req, res) {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data', error });
  }
}

// Admin: update/edit event
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const allowedFields = [
      'title', 'description', 'date', 'time', 'venue', 'capacity', 'price', 'status', 'image'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete event
async function deleteEvent(req, res) {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}

// Register for event
async function registerForEvent(req, res) {
  try {
    const { id } = req.params; // eventId
    const { userId, fullName, email, phone, department, year, amount } = req.body;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if ((event.registrations || 0) >= event.capacity) {
      return res.status(400).json({ message: "Event full." });
    }

    const existing = await Registration.findOne({ eventId: id, userId });
    if (existing) return res.status(400).json({ message: "Already registered" });

    const reg = new Registration({
      eventId: id,
      userId,
      fullName,
      email,
      phone,
      department,
      year,
      amount: amount || (event.price || 0),
    });
    await reg.save();

    event.registrations = (event.registrations || 0) + 1;
    await event.save();

    res.status(200).json({
      message: "Registered successfully",
      registrationId: reg._id
    });
  } catch (error) {
    console.error("Register event error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get events registered by logged-in student
async function getMyEvents(req, res) {
  try {
    const studentId = req.user && (req.user.id || req.user._id);
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const registrations = await Registration.find({ userId: studentId }).populate('eventId');

    const today = new Date();
    const myEvents = { upcoming: [], ongoing: [], completed: [], cancelled: [] };

    registrations.forEach(reg => {
      const eventDoc = reg.eventId;
      if (!eventDoc) return;
      const event = typeof eventDoc.toObject === 'function' ? eventDoc.toObject() : eventDoc;

  // registration/payment status removed, mark as confirmed
  event.status = event.status || 'confirmed';
      event.registrationDate = reg.createdAt || reg.registeredAt;
      event.attended = reg.attended || false;

      const eventDate = event.date ? new Date(event.date) : null;

      if (event.status.toLowerCase() === 'cancelled') myEvents.cancelled.push(event);
      else if (eventDate && eventDate > today) myEvents.upcoming.push(event);
      else if (eventDate && eventDate.toDateString() === today.toDateString()) myEvents.ongoing.push(event);
      else myEvents.completed.push(event);
    });

    res.json(myEvents);
  } catch (error) {
    console.error('Error fetching student events:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// ======================== DASHBOARD & ANALYTICS ========================

// Admin stats for dashboard
async function getAdminDashboardStats(req, res) {
  try {
    // Count users and events
    const [totalUsers, totalStudents, totalClubMembers, totalEvents, upcomingEvents] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'clubMember' }),
      Event.countDocuments({}),
      Event.countDocuments({ status: 'upcoming' }),
    ]);

    // Payments removed from scope — return users/events stats
    res.status(200).json({
      users: { total: totalUsers, students: totalStudents, clubMembers: totalClubMembers },
      events: { total: totalEvents, upcoming: upcomingEvents }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Event registrations stats for dashboard
async function getEventRegistrationsStats(req, res) {
  try {
    const monthly = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      // Count registrations for events created in this month
      const count = await Registration.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });

      monthly.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        registrations: count
      });
    }

    res.status(200).json({ monthly });
  } catch (error) {
    console.error('Event registrations stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// GET /api/admin/quick-stats
const getQuickStats = async (req, res) => {
  try {
    // Count all students and club members as "active users"
    const activeUsers = await User.countDocuments({ role: { $in: ['student', 'clubMember'] } });

    // Count events with status "past" as completed events
    const completedEvents = await Event.countDocuments({ status: 'past' });

    // Count upcoming events as pending approvals (or any other logic)
    const pendingApprovals = await Event.countDocuments({ status: 'upcoming' });

    res.status(200).json({ activeUsers, completedEvents, pendingApprovals });
  } catch (err) {
    console.error("Quick stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/recent-activity
const getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // 1️⃣ Recent Users (last 5)
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    users.forEach(u => {
      activities.push({
        type: 'user',
        action: `New user registered: ${u.name}`,
        time: u.createdAt,
        color: 'from-blue-500 to-cyan-500'
      });
    });

    // 2️⃣ Recent Events (last 5)
    const events = await Event.find().sort({ createdAt: -1 }).limit(5);
    events.forEach(e => {
      activities.push({
        type: 'event',
        action: `Event '${e.title}' created`,
        time: e.createdAt,
        color: 'from-purple-500 to-pink-500'
      });
    });

    // Payment entries removed from recent activities

    // Sort by time descending and take top 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recent = activities.slice(0, 10);

    res.status(200).json(recent);
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/event-stats
async function getEventStats(req, res) {
  try {
    const today = new Date();
    const stats = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      const eventsCount = await Event.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      const registrationsCount = await Registration.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      const attendanceCount = await Registration.countDocuments({ attended: true, createdAt: { $gte: monthStart, $lte: monthEnd } });

      stats.push({
        month: monthLabel,
        events: eventsCount,
        registrations: registrationsCount,
        attendance: attendanceCount
      });
    }

    res.status(200).json(stats);
  } catch (err) {
    console.error('getEventStats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET /api/admin/event-categories
async function getEventCategories(req, res) {
  try {
    const categories = await Event.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } }
    ]);

    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
    const data = categories.map((cat, idx) => ({
      name: cat._id || 'Other',
      value: cat.value,
      color: colors[idx % colors.length]
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error('getEventCategories error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

async function getEventPopularity(req, res) {
  try {
    const events = await Event.find();

    const registrations = await Registration.aggregate([
      {
        $group: {
          _id: '$eventId',
          totalRegistrations: { $sum: 1 },
          avgRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    const regMap = {};
    registrations.forEach(r => {
      regMap[r._id.toString()] = { totalRegistrations: r.totalRegistrations, avgRating: r.avgRating || 0 };
    });

    const flattened = [];

    events.forEach(ev => {
      const regData = regMap[ev._id.toString()] || { totalRegistrations: 0, avgRating: 0 };

      const popularity = Math.round(
        regData.totalRegistrations * 0.4 +
        ((ev.capacity ? (regData.totalRegistrations / ev.capacity) * 100 : 0) * 0.2) +
        (ev.trending ? 20 : 0) +
        (ev.featured ? 20 : 0) +
        ((regData.avgRating / 5) * 20)
      );

      flattened.push({
        category: ev.category || 'Other',
        id: ev._id,
        name: ev.title,
        popularity,
        registrations: regData.totalRegistrations,
        capacity: ev.capacity,
        avgRating: (regData.avgRating || 0).toFixed(2),
      });
    });

    // Sort by popularity descending for nicer charting
    flattened.sort((a, b) => b.popularity - a.popularity);

    res.json(flattened);
  } catch (err) {
    console.error('Error fetching category popularity:', err);
    res.status(500).json({ message: 'Failed to fetch popularity' });
  }
};



// Analytics (registrations & events)
async function getAnalytics(req, res) {
  try {
    const [totalEvents, totalUsers, totalStudents, totalClubMembers] = await Promise.all([
      Event.countDocuments({}),
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'clubMember' })
    ]);

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
      monthly[key] = monthly[key] || { month: key, events: 0, registrations: 0 };
      monthly[key].events += 1;
      monthly[key].registrations += Number(e.registrations || 0);
    }

    res.status(200).json({
      summary: { totalEvents, totalUsers, totalStudents, totalClubMembers },
      monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

//======================== CLOUDINARY ========================

//UPLOAD EVENT IMAGE
async function uploadEventImage(req, res) {
  try {
    if (!req.file) {
      console.debug('uploadEventImage: no req.file present');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    console.debug('uploadEventImage req.file:', req.file);

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'events', // optional folder name in Cloudinary
    });

    // Delete local temp file after upload (if exists)
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkErr) {
      console.warn('Failed to remove temp file:', unlinkErr && unlinkErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result && result.secure_url ? result.secure_url : null, // this is the URL you’ll store in DB
    });
  } catch (error) {
    console.error('Cloudinary upload error full:', error);
    // include limited message in response; full error is logged server-side
    res.status(500).json({ message: 'Error uploading image', error: error && error.message ? error.message : 'unknown error' });
  }
}

// CLOUDINARY STATUS CHECK
async function cloudinaryStatus(req, res) {
  try {
    const missing = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');

    if (missing.length) {
      return res.status(400).json({ ok: false, message: 'Missing env vars', missing });
    }

    // Try a harmless API call to validate credentials/network. Request a tiny resource list.
    let apiResult = null;
    try {
      apiResult = await cloudinary.api.resources({ max_results: 1 });
    } catch (apiErr) {
      console.error('Cloudinary API test error:', apiErr);
      return res.status(502).json({ ok: false, message: 'Cloudinary API call failed', error: apiErr && apiErr.message ? apiErr.message : apiErr });
    }

    res.status(200).json({ ok: true, message: 'Cloudinary reachable', resourcesReturned: Array.isArray(apiResult.resources) ? apiResult.resources.length : undefined });
  } catch (err) {
    console.error('cloudinaryStatus unexpected error:', err);
    res.status(500).json({ ok: false, message: 'Unexpected error', error: err && err.message ? err.message : err });
  }
}
//===========================attendance============================

const { updateLeaderboard } = require(`..//controllers//studentController`)
// Mark attendance based only on ticket number
async function markAttendance(req, res) {
  try {
    const { ticketNumber } = req.body;

    if (!ticketNumber) {
      return res.status(400).json({ success: false, message: "Ticket number is required" });
    }

    const registration = await Registration.findOne({ ticketNumber });

    if (!registration) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Already marked
    if (registration.attended || registration.attendanceMarked) {
      return res.json({
        status: "duplicate",
        studentData: {
          name: registration.fullName,
          ticketNumber: registration.ticketNumber,
          department: registration.department,
          year: registration.year,
        },
      });
    }

    // ✅ Mark attendance
    registration.attended = true;
    registration.attendedAt = new Date();
    registration.attendanceMarked = true;
    await registration.save();

    // ✅ Add points to leaderboard
    if (registration.userId) {
      await updateLeaderboard(registration.userId, 30); // 30 points for attendance
    }

    return res.json({
      success: true,
      studentData: {
        name: registration.fullName,
        ticketNumber: registration.ticketNumber,
        department: registration.department,
        year: registration.year,
      },
    });
  } catch (err) {
    console.error("Error marking attendance:", err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, message: "Server error", error: err && err.message ? err.message : undefined });
  }
}


// ======================== EXPORT ========================

module.exports = {
  // USERS
  getAllStudents,
  getAllClubMembers,
  addClubMember,
  promoteToClubMember,
  demoteClubMember,
  deleteClubMember,
  deleteStudent,
  getProfile,
  updateProfile,
  // EVENTS
  getEvents,
  getEventRegistrations,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  registerForEvent,
  getMyEvents,
  // DASHBOARD
  getAdminDashboardStats,
  getEventRegistrationsStats,
  getQuickStats,
  getEventStats,
  getEventCategories,
  getEventPopularity,
  getRecentActivity,
  getAnalytics,
  // CLOUDINARY
  uploadEventImage,
  cloudinaryStatus,
  //ATTENDANCE
  markAttendance,
};
