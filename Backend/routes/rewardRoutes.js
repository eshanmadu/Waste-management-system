const express = require('express');
const Reward = require('../models/Reward');
const router = express.Router();

// Get all rewards
router.get('/', async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new reward
router.post('/', async (req, res) => {
  try {
    const { name, points, description, image } = req.body;
    const newReward = new Reward({ name, points, description, image });
    await newReward.save();
    res.status(201).json(newReward);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Update a reward
router.put('/:id', async (req, res) => {
  try {
    const { name, points, description, image } = req.body;
    const updatedReward = await Reward.findByIdAndUpdate(req.params.id, { name, points, description, image }, { new: true });
    res.json(updatedReward);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// Delete a reward
router.delete('/:id', async (req, res) => {
  try {
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reward deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

module.exports = router;
