const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  }
}, { collection: 'quiz' });

module.exports = mongoose.model('Quiz', quizSchema); 