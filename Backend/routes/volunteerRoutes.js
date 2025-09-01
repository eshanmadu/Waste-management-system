const express = require('express');
const router = express.Router();
const Volunteer = require('../models/volunteer');
const { getAllVolunteers, approveVolunteer, rejectVolunteer } = require('../controllers/volunteerController');

// Get all volunteers
router.get('/', getAllVolunteers);

// Submit a new volunteer application
router.post('/', async (req, res) => {
    try {
        // Check if user already has a volunteer application
        const existingVolunteer = await Volunteer.findOne({ userId: req.body.userId });
        if (existingVolunteer) {
            return res.status(400).json({ 
                message: 'You have already submitted a volunteer application. Please wait for our response.' 
            });
        }

        // Validate required fields
        const requiredFields = [
            'name', 'email', 'phone', 'city', 'preferredArea', 
            'availability', 'hasVolunteered',
            'skills', 'motivation', 'emergencyContact'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                missingFields 
            });
        }

        // Validate availability
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hasAvailability = days.some(day => 
            req.body.availability[day] && req.body.availability[day].length > 0
        );
        
        if (!hasAvailability) {
            return res.status(400).json({ 
                message: 'Please select at least one day and time slot' 
            });
        }

        // Validate emergency contact
        if (!req.body.emergencyContact.name || 
            !req.body.emergencyContact.phone || 
            !req.body.emergencyContact.relation) {
            return res.status(400).json({ 
                message: 'Missing required emergency contact information' 
            });
        }

        // Validate agreements
        if (!req.body.agreements || 
            !req.body.agreements.safetyGuidelines || 
            !req.body.agreements.voluntaryPosition) {
            return res.status(400).json({ 
                message: 'All agreements must be accepted' 
            });
        }

        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        res.status(201).json(volunteer);
    } catch (error) {
        console.error('Error submitting volunteer application:', error);
        res.status(500).json({ message: 'Error submitting volunteer application' });
    }
});

// Approve volunteer
router.patch('/:id/approve', approveVolunteer);

// Reject volunteer
router.patch('/:id/reject', rejectVolunteer);

// Get all volunteer applications
router.get('/', async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ message: 'Error fetching volunteers', error: error.message });
    }
});

// Get a single volunteer application
router.get('/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer application not found' });
        }
        res.json(volunteer);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        res.status(500).json({ message: 'Error fetching volunteer', error: error.message });
    }
});

// Get volunteer by userId
router.get('/user/:userId', async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.params.userId });
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json(volunteer);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        res.status(500).json({ message: 'Error fetching volunteer', error: error.message });
    }
});

// Update volunteer application status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer application not found' });
        }
        res.json(volunteer);
    } catch (error) {
        console.error('Error updating volunteer status:', error);
        res.status(400).json({ message: 'Error updating volunteer status', error: error.message });
    }
});

// Delete volunteer application
router.delete('/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer application not found' });
        }

        await volunteer.remove();
        res.json({ message: 'Volunteer application deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        res.status(500).json({ message: 'Error deleting volunteer', error: error.message });
    }
});

module.exports = router;