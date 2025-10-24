// server/routes/mlRoutes.js
const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.post('/train', mlController.train);
router.post('/predict', mlController.predict);

module.exports = router;
