const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.post('/', createEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
