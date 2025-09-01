const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit a new contact form
router.post('/submit', async (req, res) => {
  try {
    const { inquiryType, message, isAnonymous } = req.body;

    const newContact = new Contact({
      name: isAnonymous ? 'Anonymous' : req.body.name,
      phone: isAnonymous ? 'N/A' : req.body.phone,
      email: isAnonymous ? 'anonymous@example.com' : req.body.email,
      inquiryType,
      message,
      isAnonymous: isAnonymous || false
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: newContact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all contact submissions (for admin)
router.get('/all', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update contact status (for admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 