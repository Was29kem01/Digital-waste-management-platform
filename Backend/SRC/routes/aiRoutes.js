const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// AI Endpoints
router.post('/chat', aiController.chat);
router.post('/analyze-photo', aiController.analyzePhoto);

module.exports = router;
