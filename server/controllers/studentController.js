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

// Get all events registered by the student
exports.getMyEvents = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch registrations for this student
    const registrations = await Registration.find({ userId: studentId })
      .populate('eventId');

    const today = new Date();
    const myEvents = { upcoming: [], ongoing: [], completed: [], cancelled: [] };

    registrations.forEach(reg => {
      const eventDoc = reg.eventId;
      if (!eventDoc) return;

      // Convert Mongoose doc to plain object
      const event = typeof eventDoc.toObject === 'function' ? eventDoc.toObject() : eventDoc;

      // Merge registration info
      event.ticketNumber = reg.ticketNumber;
      event.registrationDate = reg.createdAt || reg.registeredAt;
      event.attended = reg.attended || false;

      // include the registration id so clients can reference the registration document
      event.registrationId = reg._id;

      // Optional user info
      event.userName = reg.fullName;
      event.email = reg.email;
      event.phone = reg.phone;
      event.department = reg.department;
      event.year = reg.year;
      event.amount = reg.amount;

      // Categorize event based on date/status
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
    });

    return res.status(200).json(myEvents);
  } catch (err) {
    console.error('Error fetching student events:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Register student for an event
exports.registerForEvent = async (req, res) => {
  try {
    // 1️⃣ Check user
    const studentId = req.user && (req.user.id || req.user._id);
    console.log("Student ID:", studentId);
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    // 2️⃣ Get Event
    const { id } = req.params;
    const event = await Event.findById(id);
    console.log("Event found:", event);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 3️⃣ Check capacity
    const currentRegs = await Registration.countDocuments({ eventId: id });
    if (event.capacity && currentRegs >= event.capacity) {
      return res.status(400).json({ message: 'Event full.' });
    }

    // 4️⃣ Check existing registration
    const existing = await Registration.findOne({ eventId: id, userId: studentId });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    // 5️⃣ Collect registration info
    const { fullName, email, phone, department, year, amount } = req.body;

    // 6️⃣ Generate ticket number
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const ticketNumber = `TICK${randomNum}`;
    console.log("Generated Ticket Number:", ticketNumber);

    // 7️⃣ Save registration
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
    console.log("Saved Registration:", savedReg);

    // 8️⃣ Increment event registrations
    event.registrations = (event.registrations || 0) + 1;
    await event.save();

    // 9️⃣ Return response
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

exports.getTicket = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id; // from authMiddleware

    // Fetch registration
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
      qrCode: `QR${String(registration._id).slice(-6)}`, // simple QR code placeholder
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

    res.status(200).json({ message: 'Feedback submitted successfully', feedback: registration.feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
