const mongoose = require('mongoose');

const redeemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Reward' },
  rewardName: { type: String, required: true },
  rewardPoints: { type: Number, required: true },
  userPointsBefore: { type: Number, required: true },
  userPointsAfter: { type: Number, required: true },
  shippingInfo: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  redemptionDate: { type: Date, default: Date.now }
});

// Fix the variable name here (lowercase 'r' in redeemSchema)
module.exports = mongoose.model('Redeem', redeemSchema);