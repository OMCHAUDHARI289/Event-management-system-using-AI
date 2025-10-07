const express = require('express');
const router = express.Router();
const {
  getAllClubMembers,
  getAllStudents,
  addClubMember,
  deleteClubMember,
  promoteToClubMember,
  getAdminStats,
  getProfile,
  updateProfile,
  getAnalytics
} = require('../controllers/adminController');

// GET all club members
router.get('/members', getAllClubMembers);

// GET all registered students
router.get('/students', getAllStudents);

// POST add a new member/student
router.post('/members', addClubMember);

// DELETE a member by id
router.delete('/members/:id', deleteClubMember);

// PUT promote a student to club member
router.put('/students/:id/promote', promoteToClubMember);

// GET admin dashboard stats
router.get('/stats', getAdminStats);

// Profile routes
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);

// Analytics route
router.get('/analytics', getAnalytics);

module.exports = router;
