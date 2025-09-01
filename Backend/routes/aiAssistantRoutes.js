const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiAssistantController');

// Basic route for AI assistant
router.get('/', (req, res) => {
  res.json({ message: 'AI Assistant API is working' });
});

// Route for asking questions to AI assistant
router.post('/ask', askAI);

module.exports = router;
