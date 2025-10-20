const express = require('express');
const router = express.Router();
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
  createEvent,
  deleteEvent,
  registerForEvent,
  getMyEvents,
  // DASHBOARD
  getAdminDashboardStats,
  getEventRegistrationsStats,
  getQuickStats,
  getRecentActivity,
  getAnalytics,
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

// Create a new event
router.post('/events', createEvent);

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

// Analytics data
router.get('/analytics', getAnalytics);

module.exports = router;
