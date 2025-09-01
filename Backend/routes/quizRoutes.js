const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Get all quiz questions
router.get('/', async (req, res) => {
  try {
    console.log('Fetching quiz questions...');
    const count = await Quiz.countDocuments();
    console.log('Total documents in quiz collection:', count);
    
    const questions = await Quiz.find();
    console.log('Found questions:', questions);
    
    if (questions.length === 0) {
      console.log('No questions found in the quiz collection');
    }
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 