const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { createEvent, getMembers } = require('../controllers/clubController');

// Only clubs can access these
router.use(authMiddleware);
router.use(roleMiddleware(['club']));

router.post('/events', createEvent);
router.get('/members', getMembers);

module.exports = router;
