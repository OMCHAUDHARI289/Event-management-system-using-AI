const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  uploadBanner,
  getAllEvents,
  getMyEvents,
  registerForEvent,
  getTicket,
  submitFeedback,
  getLeaderboard, // new function
} = require('../controllers/studentController');

// profile
router.get('/me', auth, getMyProfile);
router.put('/update-profile', auth, updateProfile);
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar); // ✅ fixed
router.post('/me/banner', auth, upload.single('banner'), uploadBanner);

// events for students
router.get('/events', getAllEvents); // public list
router.post('/events/:id/register', auth, registerForEvent); // register for event (protected)
router.get('/my-events', auth, getMyEvents); // protected: my events

// get ticket for an event
router.get('/events/:id/ticket', auth, getTicket);

// submit feedback for an event
router.post('/registrations/:registrationId/feedback', auth, submitFeedback);

// leaderboard
router.get('/leaderboard', auth, getLeaderboard); // protected route to get leaderboard

module.exports = router;
