const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getMe, getAllEvents, getMyEvents } = require('../controllers/studentController');

// profile
router.get('/me', auth, getMe);

// events for students
router.get('/events', getAllEvents); // public list
router.get('/my-events', auth, getMyEvents); // placeholder protected endpoint

module.exports = router;


