const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files


const {
  // USERS / MEMBERS
  getAllStudents,
  getAllClubMembers,
  addClubMember,
  promoteToClubMember,
  deleteClubMember,
  deleteStudent,
  getProfile,
  updateProfile,
  // EVENTS
  getEvents,
  getEventById,
  getEventRegistrations,
  createEvent,
  updateEvent,
  deleteEvent,
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
  // EVENT IMAGES
  uploadEventImage,
  cloudinaryStatus,
  //ATTENDANCE
  markAttendance,
} = require('../controllers/adminController');

// -------------------- USERS / MEMBERS --------------------

// Get all club members
router.get('/members', getAllClubMembers);

// Get all students
router.get('/students', getAllStudents);

// Add a new member/student
router.post('/members', addClubMember);

// Promote student to club member
router.put('/students/:id/promote', promoteToClubMember);

// Delete a club member
router.delete('/members/:id', deleteClubMember);
// Delete a user (member or student)
router.delete('/students/:id', deleteStudent);

// Profile routes
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);

// -------------------- EVENTS --------------------

// Get all events
router.get('/events', getEvents);

// Get event by ID
router.get('/events/:id', getEventById);

// Event Registrations
router.get('/events/:eventId/registrations', getEventRegistrations);

// Create a new event
router.post('/events', createEvent);

// Update an event
router.put('/events/:id', updateEvent);

// Delete an event
router.delete('/events/:id', deleteEvent);

// Admin event management (create/delete) - student registration endpoints live under /api/student

// -------------------- DASHBOARD & ANALYTICS --------------------

// Admin dashboard stats
router.get('/stats', getAdminDashboardStats);

// GET /api/admin/event-registrations
router.get('/event-registrations', getEventRegistrationsStats);

// Quick stats
router.get('/quick-stats', getQuickStats);

// Recent activity
router.get('/recent-activity', getRecentActivity);

router.get('/event-stats',  getEventStats);
router.get('/event-categories', getEventCategories);
router.get('/popularity', getEventPopularity);

// Analytics data
router.get('/analytics', getAnalytics);

// -------------------- EVENT IMAGES --------------------
// Upload event image to Cloudinary
router.post('/upload-event-image', upload.single('image'), uploadEventImage);

// Cloudinary connectivity check
router.get('/cloudinary-status', cloudinaryStatus);

// -------------------- ATTENDANCE --------------------
router.post('/attendance', markAttendance);




module.exports = router;
