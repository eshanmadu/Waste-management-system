require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const authRoutes = require("./routes/authRoutes");
const wasteRecycleRoutes = require("./routes/wasteRecycleRoutes"); 
const wasteReportRoute = require("./routes/wasteReportRoute");
const userRoutes = require("./routes/userRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes")
const articleRoutes = require("./routes/articleRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const rewardRoutes = require('./routes/rewardRoutes');
const redeemRoutes = require('./routes/redeemRoutes');
const staff = require("./routes/staff");
const eventRoutes = require("./routes/eventRoutes");
const contactRoutes = require('./routes/contactRoutes');
const quizRoutes = require('./routes/quizRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/report", wasteReportRoute);
app.use("/api/recycle", wasteRecycleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/redeem", redeemRoutes);
app.use("/api/staff", staff);
app.use("/api/events", eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// Connect to database
connectDB();

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
