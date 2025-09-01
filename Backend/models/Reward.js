const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reward', RewardSchema);