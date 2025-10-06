const express = require('express');
const router = express.Router();
const {
  getAllClubMembers,
  getAllStudents,
  addClubMember,
  deleteClubMember,
  promoteToClubMember
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

module.exports = router;
