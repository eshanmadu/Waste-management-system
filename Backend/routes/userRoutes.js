const express = require("express");
const { getUserProfile, updateUserProfile, changePassword, getAllUsers, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Get user profile by userId
router.get("/:userId", authMiddleware, getUserProfile);

// Update user profile by userId
router.put("/:userId", authMiddleware, updateUserProfile);

// Change password by userId
router.put("/:userId/change-password", authMiddleware, changePassword);

// Delete user by ID 
router.delete("/:id", deleteUser);

module.exports = router;
