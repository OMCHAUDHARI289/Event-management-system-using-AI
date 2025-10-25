const express = require('express');
const router = express.Router();
const { summarizeFeedback , getEventFeedback } = require('../controllers/aiController');

/**
 * @route POST /api/ai/summarize-feedback?eventId=...
 */
router.post('/summarize-feedback', summarizeFeedback);

// GET feedback for a specific event
router.get('/event-feedback/:eventId', getEventFeedback);


module.exports = router;
