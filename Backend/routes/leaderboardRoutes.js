const express = require("express");
const router = express.Router();
const WasteRecycle = require("../models/wasteRecycleModel");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//  badge based on points
const getBadge = (points) => {
  if (points >= 1000) return { name: "Recycling Legend", color: "yellow-500" };
  if (points >= 500) return { name: "Planet Protector", color: "gray-400" };
  if (points >= 200) return { name: "Green Guardian", color: "amber-700" };
  return { name: "Eco Explorer", color: "blue-500" };
};

// Leaderboard Route
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let currentUserId = null;

   
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Backend - Received token:", token ? "Present" : "Missing");
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
        console.log("Backend - Decoded token:", {
          userId: decoded.userId,
          fullDecoded: decoded
        });
      } catch (error) {
        console.error("Backend - Error decoding token:", error);
      }
    }

    // First, get all recycling entries
    const recyclingEntries = await WasteRecycle.find({})
      .select('userId points quantity')
      .populate('userId', 'firstName lastName')
      .sort({ points: -1 });

    console.log("Backend - Total recycling entries found:", recyclingEntries.length);

    // Group entries by user
    const userMap = new Map();
    recyclingEntries.forEach(entry => {
      if (!entry.userId) return;
      
      const userId = entry.userId._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId: entry.userId._id,
          name: `${entry.userId.firstName} ${entry.userId.lastName}`.trim(),
          totalPoints: 0,
          totalQuantity: 0
        });
      }
      
      const userData = userMap.get(userId);
      userData.totalPoints += entry.points || 0;
      userData.totalQuantity += entry.quantity || 0;
    });

    console.log("Backend - Users in map:", userMap.size);

    // Convert to array and sort by points
    let leaderboard = Array.from(userMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => {
        const userIdStr = entry.userId.toString();
        const badge = getBadge(entry.totalPoints);
        const isCurrentUser = userIdStr === currentUserId;
        
        console.log(`Backend - Processing user:`, {
          name: entry.name,
          userId: userIdStr,
          currentUserId,
          isCurrentUser
        });

        return {
          rank: index + 1,
          userId: userIdStr,
          name: entry.name,
          totalRecycled: entry.totalQuantity,
          points: entry.totalPoints,
          badge: badge.name,
          badgeColor: badge.color,
          isCurrentUser
        };
      });

    // filter results
    if (search) {
      leaderboard = leaderboard.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const finalData = leaderboard.slice(0, 10);
    console.log("Backend - Final leaderboard data:", {
      currentUserId,
      userCount: finalData.length,
      firstUser: finalData[0]
    });

    // Return only the top 10 users for normal leaderboard
    res.json({
      success: true,
      data: finalData,
      currentUserId: currentUserId
    });
  } catch (error) {
    console.error("Backend - Leaderboard error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
});

module.exports = router;