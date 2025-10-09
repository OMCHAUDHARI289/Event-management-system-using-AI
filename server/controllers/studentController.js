const Event = require('../models/Event');

// Get current logged-in student's profile
exports.getMe = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public: list all events for students
exports.getAllEvents = async (_req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Example: list my registered events (placeholder until registration model exists)
exports.getMyEvents = async (req, res) => {
  try {
    // Without a registration model, return upcoming events as a placeholder
    const events = await Event.find({}).sort({ date: 1 }).limit(5);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


