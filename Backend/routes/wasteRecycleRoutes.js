// routes/wasteRecyclesRoutes.js
const express = require("express");
const router = express.Router();
const WasteRecycle = require("../models/wasteRecycleModel");
const User = require("../models/User"); // Assuming you have a User model

// Get all recycling submissions with user details
router.get("/", async (req, res) => {
  try {
    // First, get all active users
    const activeUsers = await User.find({}, '_id');
    const activeUserIds = activeUsers.map(user => user._id);

    // Get submissions only for active users
    const submissions = await WasteRecycle.find({
      userId: { $in: activeUserIds }
    })
    .populate('userId', 'firstName lastName email phoneNumber')
    .sort({ dateTime: -1 });

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      userId: sub.userId?._id || null,
      userName: sub.userId ? `${sub.userId.firstName} ${sub.userId.lastName}` : 'Deleted User',
      userPhone: sub.userId?.phoneNumber || 'N/A',
      wasteType: sub.wasteType,
      quantity: sub.quantity,
      recyclingCenter: sub.recyclingCenter,
      dateTime: sub.dateTime,
      points: sub.points,
      redeemPoints: sub.redeemPoints,
      status: sub.status,
      otp: sub.otp
    }));

    res.json({
      success: true,
      data: formattedSubmissions
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Create new recycling entry
router.post("/", async (req, res) => {
  try {
    const { userId, wasteType, quantity, recyclingCenter, dateTime, status, otp } = req.body;

    console.log('Request body:', req.body);
    console.log('Received dateTime:', dateTime);
    console.log('dateTime type:', typeof dateTime);

    // Validation
    if (!userId || !wasteType || !quantity || !recyclingCenter || !dateTime) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Calculate points
    const points = parseFloat(quantity) * 5;
    
    // Create new recycle entry
    const newEntry = new WasteRecycle({
      userId,
      wasteType,
      quantity: parseFloat(quantity),
      recyclingCenter,
      dateTime: new Date(dateTime),
      points,
      redeemPoints: points * 10,
      status: status || "Pending",
      otp: otp || {
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        verified: false
      }
    });

    console.log('New entry before save:', newEntry);

    // Update user's points
    user.totalPoints += points;
    user.redeemPoints += points * 10;
    await user.save();

    const savedEntry = await newEntry.save();
    console.log('Saved entry:', savedEntry);

    // Format the response to include all necessary fields
    const responseData = {
      _id: savedEntry._id,
      userId: savedEntry.userId,
      wasteType: savedEntry.wasteType,
      quantity: savedEntry.quantity,
      recyclingCenter: savedEntry.recyclingCenter,
      dateTime: savedEntry.dateTime,
      points: savedEntry.points,
      redeemPoints: savedEntry.redeemPoints,
      status: savedEntry.status,
      otp: savedEntry.otp
    };
    
    console.log('Response data:', responseData);
    
    res.status(201).json({ 
      success: true, 
      data: responseData,
      points: points,
      redeemPoints: user.redeemPoints
    });

  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Update existing entry
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingEntry = await WasteRecycle.findById(id);
    if (!existingEntry) {
      return res.status(404).json({ 
        success: false, 
        message: "Entry not found" 
      });
    }

    // Handle quantity changes
    if (updateData.quantity && updateData.quantity !== existingEntry.quantity) {
      const user = await User.findById(existingEntry.userId);
      const pointsDifference = (updateData.quantity - existingEntry.quantity) * 5;
      
      user.totalPoints += pointsDifference;
      user.redeemPoints += pointsDifference * 10;
      await user.save();
    }

    const updatedEntry = await WasteRecycle.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ 
      success: true, 
      data: updatedEntry 
    });

  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Delete entry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await WasteRecycle.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ 
        success: false, 
        message: "Entry not found" 
      });
    }

    // Deduct points from user
    const user = await User.findById(deletedEntry.userId);
    const pointsDeduct = deletedEntry.quantity * 5;
    
    user.totalPoints -= pointsDeduct;
    user.redeemPoints -= pointsDeduct * 10;
    await user.save();

    res.json({ 
      success: true, 
      message: "Entry deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// User search endpoint
router.get('/users/search', async (req, res) => {
  try {
    const { search } = req.query;
    
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    }).select('_id firstName lastName email phoneNumber').limit(10);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Handle redemption
router.post('/redeem', async (req, res) => {
  try {
    const { userId, points } = req.body;
    
    if (!userId || !points) {
      return res.status(400).json({
        success: false,
        message: "userId and points are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.redeemPoints < points) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points"
      });
    }

    user.redeemPoints -= points;
    await user.save();

    res.json({
      success: true,
      data: {
        newBalance: user.redeemPoints,
        redemptionDate: new Date()
      }
    });

  } catch (error) {
    console.error("Redemption error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get recycling submissions for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First find the user by their UUID
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Then find recycling submissions using the user's MongoDB _id
    const submissions = await WasteRecycle.find({ userId: user._id })
      .sort({ dateTime: -1 })
      .limit(5); // Get only the 5 most recent submissions

    // Format the submissions to match the frontend expectations
    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      wasteType: sub.wasteType,
      quantity: sub.quantity,
      recyclingCenter: sub.recyclingCenter,
      dateTime: sub.dateTime,
      points: sub.points,
      status: sub.status
    }));

    res.json({
      success: true,
      data: formattedSubmissions
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;