const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true
  },
  nicId: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  
  // Staff Role Details
  role: {
    type: String,
    required: true,
    enum: ['Collector', 'Driver', 'FieldOfficer', 'Supervisor', 'Recycler']
  },
  assignedRegion: {
    type: String,
    required: true
  },
  shiftAvailability: {
    type: String,
    enum: ['Morning', 'Evening', 'Night']
  },
  
  // Additional fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Staff', staffSchema); 