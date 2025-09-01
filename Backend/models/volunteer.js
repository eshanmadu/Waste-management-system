const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    // User Information (from token)
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },

    // Application Information
    city: {
        type: String,
        required: true,
        trim: true
    },
    preferredArea: {
        type: String,
        required: true,
        trim: true
    },
    availability: {
        Monday: [String],
        Tuesday: [String],
        Wednesday: [String],
        Thursday: [String],
        Friday: [String],
        Saturday: [String],
        Sunday: [String]
    },
    hasVolunteered: {
        type: Boolean,
        default: false
    },
    pastExperience: { type: String },
    skills: {
        type: [String],
        required: true
    },
    motivation: {
        type: String,
        required: true,
        trim: true
    },

    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        relation: {
            type: String,
            required: true,
            trim: true
        }
    },

    // Agreements
    agreements: {
        safetyGuidelines: {
            type: Boolean,
            required: true,
            default: false
        },
        voluntaryPosition: {
            type: Boolean,
            required: true,
            default: false
        }
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
volunteerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;