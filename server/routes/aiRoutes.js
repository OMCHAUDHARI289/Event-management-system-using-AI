const express = require('express');
const router = express.Router();
const { summarizeFeedback } = require('../controllers/aiController');

router.post('/summarize-feedback', summarizeFeedback);

module.exports = router;
