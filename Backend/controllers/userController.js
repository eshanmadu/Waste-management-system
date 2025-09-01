const User = require("../models/User");
const bcrypt = require("bcryptjs");
const WasteReport = require("../models/wasteReportModel");
const WasteRecycle = require("../models/wasteRecycleModel");
const Volunteer = require("../models/volunteer");
const Contact = require("../models/Contact");
const Events = require("../models/Events");
const Quiz = require("../models/Quiz");
const Redeems = require("../models/Redeems");
const Articles = require("../models/Articles");

// Get user profile by userId (UUID)
const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId }).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update user profile by userId (UUID)
const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Prevent accidental password overwrite
  if (updates.password) {
    delete updates.password;
  }

  try {
    const user = await User.findOneAndUpdate(
      { userId }, 
      updates,
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Change password by userId (UUID)
const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect old password" });
    }

    // Hash new password before saving
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Delete user by ID (using userId)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user first to get their email (which is used as a reference in other collections)
    const user = await User.findOne({ userId: id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all associated data
    await Promise.all([
      // Delete waste reports
      WasteReport.deleteMany({ userId: id }),
      // Delete waste recycling records
      WasteRecycle.deleteMany({ userId: id }),
      // Delete volunteer records
      Volunteer.deleteMany({ userId: id }),
      // Delete contact messages
      Contact.deleteMany({ email: user.email }),
      // Delete event registrations
      Events.updateMany(
        { "registeredUsers.userId": id },
        { $pull: { registeredUsers: { userId: id } } }
      ),
      // Delete quiz attempts
      Quiz.updateMany(
        { "attempts.userId": id },
        { $pull: { attempts: { userId: id } } }
      ),
      // Delete reward redemptions
      Redeems.deleteMany({ userId: id }),
      // Delete articles authored by user
      Articles.deleteMany({ authorId: id }),
      // Finally delete the user
      User.findOneAndDelete({ userId: id })
    ]);
    
    res.json({ 
      message: 'User and all associated data deleted successfully',
      deletedData: {
        wasteReports: true,
        wasteRecycling: true,
        volunteerRecords: true,
        contactMessages: true,
        eventRegistrations: true,
        quizAttempts: true,
        rewardRedemptions: true,
        articles: true
      }
    });
  } catch (error) {
    console.error('Error deleting user and associated data:', error);
    res.status(500).json({ message: 'Error deleting user and associated data' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser
};

