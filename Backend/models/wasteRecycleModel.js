const mongoose = require("mongoose");

const WasteSchema = new mongoose.Schema({
  // Reference to the user who submitted the recycling
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Waste details
  wasteType: {
    type: String,
    required: true,
    enum: ['Plastic', 'Paper', 'Glass', 'Metal', 'Electronics', 'Other'],
    trim: true
  },
  
  quantity: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity must be at least 0.1 kg'],
    max: [1000, 'Quantity cannot exceed 1000 kg']
  },
  
  recyclingCenter: {
    type: String,
    required: true,
    enum: [
      'Central Recycling Center',
      'North Recycling Center',
      'South Recycling Center',
      'East Recycling Center',
      'West Recycling Center'
    ]
  },
  
  // Date and time of recycling
  dateTime: {
    type: Date,
    required: true
  },
  
  // Points system
  points: {
    type: Number,
    required: true,
    default: 0
  },
  
  redeemPoints: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Processed', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  
  // Verification
  otp: {
    code: String,
    expiresAt: Date,
    verified: { type: Boolean, default: false }
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Verification details
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: Date,
  
  // Image/document references
  attachments: [{
    type: String, // URLs to stored images/documents
    trim: true
  }]
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Calculate points before saving
WasteSchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    this.points = this.quantity * 5; // 5 points per kg
    this.redeemPoints = this.points * 10; // 10x multiplier for redeem points
  }
  next();
});

// Indexes for better query performance
WasteSchema.index({ userId: 1, createdAt: -1 });
WasteSchema.index({ status: 1 });
WasteSchema.index({ wasteType: 1 });

module.exports = mongoose.model("WasteRecycle", WasteSchema);