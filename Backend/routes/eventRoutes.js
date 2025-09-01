const express = require('express');
const router = express.Router();
const Event = require('../models/Events');
const mongoose = require('mongoose');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get a single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Error creating event' });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ message: 'Error updating event' });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Join an event
router.post('/:id/join', async (req, res) => {
  try {
    console.log('Join event request body:', req.body);
    console.log('Event ID:', req.params.id);

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid event ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    // Validate user and volunteer IDs
    if (!req.body.userId || !req.body.volunteerId) {
      console.log('Missing IDs:', { userId: req.body.userId, volunteerId: req.body.volunteerId });
      return res.status(400).json({ message: 'Missing user ID or volunteer ID' });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = event.participants.some(
      participant => participant.userId === req.body.userId
    );
    
    if (isAlreadyParticipant) {
      console.log('User already joined this event');
      return res.status(400).json({ message: 'Already joined this event' });
    }

    if (event.participants.length >= event.maxParticipants) {
      console.log('Event is full');
      return res.status(400).json({ message: 'Event is full' });
    }

    try {
      // Convert volunteerId to ObjectId
      let volunteerId;
      try {
        volunteerId = new mongoose.Types.ObjectId(req.body.volunteerId);
      } catch (idError) {
        console.error('Error converting volunteer ID:', idError);
        return res.status(400).json({ message: 'Invalid volunteer ID format' });
      }

      // Add new participant
      event.participants.push({
        userId: req.body.userId, // Keep as string (UUID)
        volunteerId,
        joinedAt: new Date()
      });
      
      await event.save();
      console.log('Event saved successfully');
      console.log('Event data:', {
        _id: event._id,
        title: event.title,
        participants: event.participants.map(p => ({
          userId: p.userId,
          volunteerId: p.volunteerId,
          joinedAt: p.joinedAt
        }))
      });
      res.json(event);
    } catch (saveError) {
      console.error('Error saving event:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Detailed error joining event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error joining event',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Leave an event
router.post('/:id/leave', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participantIndex = event.participants.indexOf(req.body.userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not joined this event' });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ message: 'Error leaving event' });
  }
});

module.exports = router; 