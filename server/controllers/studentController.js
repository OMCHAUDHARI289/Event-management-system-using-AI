const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Leaderboard = require('../models/Leaderboard'); // new model
const User = require('../models/User');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const { updateAchievements } = require('../utils/achievementUtils'); // <-- server utils


// Utility to update leaderboard points
const updateLeaderboard = async (userId, pointsToAdd = 0) => {
  let lb = await Leaderboard.findOne({ userId });
  if (!lb) {
    lb = new Leaderboard({ userId });
  }

  lb.points += pointsToAdd;
  lb.lastUpdated = new Date();

  // Update level based on points
  if (lb.points >= 2500) lb.level = 'Platinum';
  else if (lb.points >= 2000) lb.level = 'Gold';
  else if (lb.points >= 1500) lb.level = 'Silver';
  else lb.level = 'Bronze';

  await lb.save();
};

// Get current logged-in student's profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean(); // lean() for plain JS object
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch leaderboard entry for this user
    const lb = await Leaderboard.findOne({ userId: user._id });

    // Calculate points if leaderboard not found
    let points = lb ? lb.points : 0;
    let level = 'Bronze';
    if (points >= 2500) level = 'Platinum';
    else if (points >= 2000) level = 'Gold';
    else if (points >= 1500) level = 'Silver';

    // Calculate streak based on registrations
    const registrations = await Registration.find({ userId: user._id });
    const attendedDates = registrations
      .filter(r => r.attended)
      .map(r => new Date(r.createdAt || r.registeredAt).toDateString())
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let prevDate = null;
    for (let dateStr of attendedDates) {
      const date = new Date(dateStr);
      if (!prevDate) streak = 1;
      else {
        const diff = (new Date(prevDate) - date) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak += 1;
        else break;
      }
      prevDate = date;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      prn: user.prn || '',
      department: user.department || '',
      location: user.location || '',
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      bannerImage: user.bannerImage || '',
      role: user.role,
      certificates: user.certificates || [],
      achievements: user.achievements || [],
      points,
      level,
      streak,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update personal info
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, prn, department, location, bio, profileImage, bannerImage} = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.prn = prn || user.prn;
    user.department = department || user.department;
    user.location = location || user.location;
    user.bio = bio || user.bio;
    user.profileImage = profileImage || user.profileImage;
    user.bannerImage = bannerImage || user.bannerImage;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload user avatar
exports.uploadAvatar = async (req, res) => {
  try {
    // ✅ Use the logged-in user's ID from JWT
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars', // separate folder for user avatars
      width: 300,
      height: 300,
      crop: 'fill',
    });

    // ✅ Delete temporary local file
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // ✅ Save Cloudinary URL to user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: result.secure_url },
      { new: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url,
      user,
    });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Error uploading avatar', error: err.message });
  }
};

// controllers/studentController.js
exports.uploadBanner = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'banners',
      width: 1200,       // banner width
      height: 400,       // banner height
      crop: 'fill',
    });

    // Delete local temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      userId,
      { bannerImage: result.secure_url },
      { new: true, select: '-password' }
    );

    res.status(200).json({ success: true, bannerUrl: result.secure_url, user });

  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ message: 'Error uploading banner', error: err.message });
  }
};

exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('certificates');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ certificates: user.certificates || [] });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all events registered by the student
// Get all events registered by the student
exports.getMyEvents = async (req, res) => {
  try {
    console.log('getMyEvents called for user:', req.user);
    const studentId = req.user.id || req.user._id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const registrations = await Registration.find({ userId: studentId }).populate('eventId');
    console.log('Found registrations:', registrations.length);

    const today = new Date();
    const myEvents = { upcoming: [], ongoing: [], completed: [], cancelled: [] };
    let totalAttendedPoints = 0;

    registrations.forEach(reg => {
      const eventDoc = reg.eventId;
      if (!eventDoc) return;

      const event = typeof eventDoc.toObject === 'function' ? eventDoc.toObject() : eventDoc;

      // Merge registration info
      event.ticketNumber = reg.ticketNumber;
      event.registrationDate = reg.createdAt || reg.registeredAt;
      event.attended = reg.attended || false;
      event.registrationId = reg._id;
      event.userName = reg.fullName;
      event.email = reg.email;
      event.phone = reg.phone;
      event.department = reg.department;
      event.year = reg.year;
      event.amount = reg.amount;

      const eventDate = event.date ? new Date(event.date) : null;

      if (event.status && event.status.toLowerCase() === 'cancelled') {
        myEvents.cancelled.push(event);
      } else if (eventDate) {
        const sameDay = eventDate.toDateString() === today.toDateString();
        if (sameDay) myEvents.ongoing.push(event);
        else if (eventDate > today) myEvents.upcoming.push(event);
        else myEvents.completed.push(event);
      } else {
        myEvents.upcoming.push(event);
      }

      if (reg.attended) totalAttendedPoints += 30; // attendance points
    });

    res.status(200).json({
      myEvents,
      totalAttendedPoints,  // frontend can use this to show points
    });
  } catch (err) {
    console.error('Error fetching student events:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Register student for an event
exports.registerForEvent = async (req, res) => {
  try {
    const studentId = req.user && (req.user.id || req.user._id);
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const currentRegs = await Registration.countDocuments({ eventId: id });
    if (event.capacity && currentRegs >= event.capacity) {
      return res.status(400).json({ message: 'Event full.' });
    }

    const existing = await Registration.findOne({ eventId: id, userId: studentId });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const { fullName, email, phone, department, year, amount } = req.body;

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketNumber = `TICK${randomNum}`;

    const reg = new Registration({
      eventId: id,
      userId: studentId,
      fullName,
      email,
      phone,
      department,
      year,
      amount: amount || (event.price || 0),
      ticketNumber,
    });

    const savedReg = await reg.save();

    event.registrations = (event.registrations || 0) + 1;
    await event.save();

    // ✅ Update leaderboard points for registration
    await updateLeaderboard(studentId, 20);

    res.status(200).json({
      message: 'Registered successfully',
      registrationId: savedReg._id,
      ticketNumber: savedReg.ticketNumber,
    });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get ticket for a registration
exports.getTicket = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const registration = await Registration.findOne({ _id: registrationId, userId }).populate('eventId');
    if (!registration) return res.status(404).json({ message: "Ticket not found" });

    const event = registration.eventId;

    const ticketData = {
      ticketNumber: registration.ticketNumber,
      eventTitle: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      category: event.category,
      price: registration.amount,
      userName: registration.fullName,
      email: registration.email,
      qrCode: `QR${String(registration._id).slice(-6)}`,
    };

    res.status(200).json({
      message: 'Ticket fetched successfully',
      registrationId: registration._id,
      ticketNumber: registration.ticketNumber,
      ticketData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit feedback for an attended event
exports.submitFeedback = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { rating, comments } = req.body;
    const studentId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const registration = await Registration.findById(registrationId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.userId.toString() !== studentId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!registration.attended) {
      return res.status(400).json({ message: 'Cannot give feedback for unattended event' });
    }

    registration.feedback = { rating, comments };
    await registration.save();

    // ✅ Update leaderboard points for feedback
    await updateLeaderboard(studentId, 15);

    res.status(200).json({ message: 'Feedback submitted successfully', feedback: registration.feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Utility to calculate streak of consecutive attended days
const calculateStreak = (dates) => {
  if (!dates.length) return 0;
  const sortedDates = dates
    .map(d => new Date(d).toDateString()) // only date part
    .sort((a, b) => new Date(b) - new Date(a)); // most recent first

  let streak = 0;
  let prevDate = null;

  for (let dateStr of sortedDates) {
    const date = new Date(dateStr);
    if (!prevDate) {
      streak = 1;
    } else {
      const diffDays = (new Date(prevDate) - date) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) streak += 1; // consecutive
      else break; // streak broken
    }
    prevDate = date;
  }

  return streak;
};

exports.getLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user._id;

    // Fetch all users
    const users = await User.find().select('name email phone studentId department role clubName achievements');

    // Fetch all registrations
    const registrations = await Registration.find();

    // Group registrations by user for stats
    const userStats = {};
    registrations.forEach(reg => {
      const id = reg.userId.toString();
      if (!userStats[id]) userStats[id] = { totalRegistrations: 0, totalAttended: 0, totalFeedback: 0, attendedDates: [] };
      
      userStats[id].totalRegistrations += 1;
      if (reg.attended) {
        userStats[id].totalAttended += 1;
        userStats[id].attendedDates.push(new Date(reg.createdAt || reg.registeredAt));
      }
      if (reg.feedback && reg.feedback.rating) userStats[id].totalFeedback += 1;
    });

    // Build leaderboard with achievements
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const stats = userStats[user._id.toString()] || { totalRegistrations: 0, totalAttended: 0, totalFeedback: 0, attendedDates: [] };
        const points = stats.totalRegistrations * 20 + stats.totalAttended * 30 + stats.totalFeedback * 15;

        let level = 'Bronze';
        if (points >= 2500) level = 'Platinum';
        else if (points >= 2000) level = 'Gold';
        else if (points >= 1500) level = 'Silver';

        const streak = calculateStreak(stats.attendedDates);

        // ✅ Update achievements for this user
        await updateAchievements(user._id, stats, points, level, streak);

        return {
          userId: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            studentId: user.studentId || null,
            department: user.department || null,
            role: user.role || null,
            clubName: user.clubName || null,
          },
          stats,
          points,
          level,
          streak,
          achievements: user.achievements || []
        };
      })
    );

    // Sort by points descending and assign rank & trend
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((entry, index, arr) => {
      entry.rank = index + 1;
      if (index === 0) entry.trend = 'same';
      else entry.trend = entry.points > arr[index - 1].points ? 'up' :
                        entry.points < arr[index - 1].points ? 'down' : 'same';
    });

    // Current user info
    const currentUserEntry = leaderboard.find(l => l.userId._id.toString() === currentUserId.toString());
    const currentUserStats = currentUserEntry ? currentUserEntry.stats : { totalRegistrations: 0, totalAttended: 0, totalFeedback: 0 };

    res.status(200).json({
      leaderboard,
      currentUser: {
        ...currentUserEntry?.userId,
        points: currentUserEntry?.points || 0,
        level: currentUserEntry?.level || 'Bronze',
        rank: currentUserEntry?.rank || null,
        trend: currentUserEntry?.trend || 'same',
        totalRegistrations: currentUserStats.totalRegistrations,
        totalAttended: currentUserStats.totalAttended,
        totalFeedback: currentUserStats.totalFeedback,
        streak: currentUserEntry?.streak || 0,
        achievements: currentUserEntry?.achievements || []
      }
    });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// Public: list all events (used by student frontend)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events for students:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

