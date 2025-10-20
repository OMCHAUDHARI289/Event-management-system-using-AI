const Event = require('../models/Event');
const Registration = require('../models/Registration');

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
    // Optional: read studentId from query if passed, else show all
    const studentId = req.query.studentId;

    // If you still want it open for all demo users:
    const registrations = studentId
      ? await Registration.find({ userId: studentId }).populate('eventId')
      : await Registration.find().populate('eventId');

    const today = new Date();
    const myEvents = { upcoming: [], ongoing: [], completed: [], cancelled: [] };

    registrations.forEach(reg => {
      const eventDoc = reg.eventId;
      if (!eventDoc) return;

      const event = typeof eventDoc.toObject === 'function' ? eventDoc.toObject() : eventDoc;
      event.status = event.status || 'confirmed';
      event.registrationDate = reg.createdAt || reg.registeredAt;
      event.attended = reg.attended || false;

      const eventDate = event.date ? new Date(event.date) : null;
      if (event.status && event.status.toLowerCase() === 'cancelled') myEvents.cancelled.push(event);
      else if (eventDate && eventDate > today) myEvents.upcoming.push(event);
      else if (eventDate && eventDate.toDateString() === today.toDateString()) myEvents.ongoing.push(event);
      else myEvents.completed.push(event);
    });

    res.json(myEvents);
  } catch (error) {
    console.error('Error fetching student events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Register student for an event
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params; // event id
    const studentId = req.user && (req.user.id || req.user._id);
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if ((event.registrations || 0) >= (event.capacity || Infinity)) {
      return res.status(400).json({ message: 'Event full.' });
    }

    const existing = await Registration.findOne({ eventId: id, userId: studentId });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const { fullName, email, phone, department, year, amount } = req.body;
    const reg = new Registration({
      eventId: id,
      userId: studentId,
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

    res.status(200).json({ message: 'Registered successfully', registrationId: reg._id });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id; // from authMiddleware

    // Fetch registration
    const registration = await Registration.findOne({ _id: registrationId, userId }).populate('eventId');
    if (!registration) return res.status(404).json({ message: "Ticket not found" });

    const event = registration.eventId;

    const ticket = {
      ticketNumber: registration._id,
      eventTitle: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      category: event.category,
      price: registration.amount,
      userName: registration.fullName,
      email: registration.email,
      qrCode: `QR${String(registration._id).slice(-6)}`, // simple QR code placeholder
    };

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
