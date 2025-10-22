const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getMe, getAllEvents, getMyEvents, registerForEvent, getTicket, submitFeedback } = require('../controllers/studentController');

// profile
router.get('/me', auth, getMe);

// events for students
router.get('/events', getAllEvents); // public list
router.post('/events/:id/register', auth, registerForEvent); // register for event (protected)
router.get('/my-events', auth, getMyEvents); // protected: my events

// get ticket for an event
router.get('/events/:id/ticket', auth, getTicket);

// submit feedback for an event
router.post('/registrations/:registrationId/feedback', auth, submitFeedback);
module.exports = router;


