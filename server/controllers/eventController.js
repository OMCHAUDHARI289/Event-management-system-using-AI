const Event = require('../models/Event');

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data', error });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// ✅ Register user for an event (now using Registration model)
const Registration = require('../models/Registration');

exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params; // Event ID
    const { userId } = req.body; // Logged-in user ID

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.registrations >= event.capacity) {
      return res.status(400).json({ message: "Registration closed. Event full." });
    }

    // Check existing registration in separate collection
    const existing = await Registration.findOne({ eventId: id, userId });
    if (existing) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // Create registration using payload student details
    const { fullName, email, phone, department, year, amount } = req.body;
    const reg = new Registration({
      eventId: id,
      userId,
      fullName,
      email,
      phone,
      department,
      year,
      amount: amount || (event.price || 0),
      paymentStatus: event.isPaid ? 'pending' : 'success'
    });
    await reg.save();

    // increment event count
    event.registrations = (event.registrations || 0) + 1;
    await event.save();

    // Respond
    if (event.isPaid) {
      res.status(200).json({ message: "Event requires payment.", payment: true, amount: reg.amount, registrationId: reg._id });
    } else {
      res.status(200).json({ message: "Successfully registered for the event!", payment: false, registrationId: reg._id });
    }
  } catch (error) {
    console.error("Register event error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get events registered by the logged-in student
exports.getMyEvents = async (req, res) => {
  try {
    const studentId = req.user && (req.user.id || req.user._id);

    // If no authenticated user, return empty or 401 depending on desired behavior
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch all registrations for this student and populate the event data
    const registrations = await Registration.find({ userId: studentId }).populate('eventId');

    // Categorize events
    const today = new Date();
    const myEvents = {
      upcoming: [],
      ongoing: [],
      completed: [],
      cancelled: [],
    };

    registrations.forEach((reg) => {
      const eventDoc = reg.eventId;
      if (!eventDoc) return; // safety
      const event = (typeof eventDoc.toObject === 'function') ? eventDoc.toObject() : eventDoc;

      // Derive status from registration/payment info if not present on event
      const regStatus = reg.paymentStatus || 'pending';
      event.status = event.status || (regStatus === 'success' ? 'confirmed' : 'pending');
      event.registrationDate = reg.createdAt || reg.registeredAt;
      event.attended = reg.attended || false;

      const eventDate = event.date ? new Date(event.date) : null;

      if (event.status && event.status.toLowerCase() === 'cancelled') {
        myEvents.cancelled.push(event);
      } else if (eventDate && eventDate > today) {
        myEvents.upcoming.push(event);
      } else if (eventDate && eventDate.toDateString() === today.toDateString()) {
        myEvents.ongoing.push(event);
      } else {
        myEvents.completed.push(event);
      }
    });

    return res.json(myEvents);
  } catch (error) {
    console.error('Error fetching student events:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
