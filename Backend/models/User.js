const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Ensure userId is stored
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  country: { type: String, required: true },
  password: { type: String, required: true },
  photo: { type: String, default: "" }, // Optional profile photo
  totalPoints: { type: Number, default: 0 },
  redeemPoints: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
