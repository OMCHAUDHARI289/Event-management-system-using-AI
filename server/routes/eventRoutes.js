const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent, getEventById, registerForEvent, getMyEvents } = require('../controllers/eventController');

router.get('/', getEvents);
router.post('/', createEvent);
router.delete('/:id', deleteEvent);
// routes/eventRoutes.js
router.get('/:id', getEventById);

// New register route
router.post('/:id/register', registerForEvent);

// GET /api/student/my-events
router.get("/student/my-events", getMyEvents);

// Confirm payment for registration
router.post('/registration/:registrationId/confirm', async (req, res) => {
	try {
		const Registration = require('../models/Registration');
		const reg = await Registration.findById(req.params.registrationId);
		if (!reg) return res.status(404).json({ message: 'Registration not found' });
		reg.paymentStatus = 'success';
		await reg.save();
		res.json({ message: 'Payment confirmed', registrationId: reg._id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
});


module.exports = router;
