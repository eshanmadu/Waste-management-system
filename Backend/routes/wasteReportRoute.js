const express = require("express");
const WasteReport = require("../models/wasteReportModel"); // Import model
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // Auth middleware
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "waste-reports",
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    resource_type: 'auto'
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB."
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

// 🚀 POST - Create a new report (Only authenticated users)
router.post("/report", authMiddleware, async (req, res) => {
  try {
    const { 
      wasteType, 
      location, 
      reportDate, 
      description, 
      reporterName, 
      userId,
      latitude,
      longitude
    } = req.body;

    console.log("Creating new report with data:", {
      wasteType,
      location,
      reportDate,
      description,
      reporterName,
      userId,
      latitude,
      longitude
    });

    const newReport = new WasteReport({
      wasteType,
      location,
      latitude,
      longitude,
      reportDate: new Date(reportDate),
      description,
      reporterName: reporterName || "Anonymous",
      userId,
      status: "Pending",
      createdAt: new Date()
    });

    const savedReport = await newReport.save();
    console.log("Report saved successfully:", savedReport);

    res.status(201).json({ 
      message: "Report submitted successfully!",
      report: savedReport
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ 
      message: "Error submitting report",
      error: error.message
    });
  }
});

// 🔍 GET - Fetch all reports
router.get("/reports", async (req, res) => {
  try {
    console.log("Fetching all reports");

    // Fetch all reports with proper sorting
    const reports = await WasteReport.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    console.log("Fetched Reports count:", reports.length);
    
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ 
      message: "Error fetching reports",
      error: error.message 
    });
  }
});

// 🔍 GET - Fetch reports by user ID
router.get("/reports/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching reports for user ID:", userId);

    const reports = await WasteReport.find({ userId });
    console.log("Fetched Reports:", reports);

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🗑 DELETE - Remove a report (Anyone can delete by ID)
router.delete("/reports/:id", async (req, res) => {
  try {
    
    const { id } = req.params;
    const report = await WasteReport.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await WasteReport.findByIdAndDelete(id);
    res.status(200).json({ message: "Report deleted successfully!" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Error deleting report" });
  }
});

// ✏ PUT - Update report status
router.put("/reports/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating status for report:", id);
    console.log("New status:", status);

    // Check if status is valid
    if (!status || !["Pending", "In Progress", "Resolved"].includes(status)) {
      console.log("Invalid status value:", status);
      return res.status(400).json({ 
        message: "Invalid status value. Must be one of: Pending, In Progress, Resolved",
        receivedStatus: status 
      });
    }

    // Find and update the report
    const report = await WasteReport.findById(id);
    if (!report) {
      console.log("Report not found:", id);
      return res.status(404).json({ message: "Report not found" });
    }

    console.log("Found report:", report);

    // Update status
    report.status = status;
    const updatedReport = await report.save();

    console.log("Status updated successfully:", updatedReport);

    res.status(200).json({ 
      message: "Status updated successfully", 
      updatedReport: updatedReport 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ 
      message: "Error updating status",
      error: error.message,
      stack: error.stack 
    });
  }
});

router.get("/searchByName", async (req, res) => {
  try {
    const name = req.query.name;
    
    if (!name) {
      return res.status(400).json({ message: "Name query parameter is required." });
    }

    console.log("Searching for reports by name:", name);
    
    // Use case-insensitive partial match instead of exact match
    const reports = await WasteReport.find({ 
      reporterName: { $regex: name, $options: 'i' } 
    });

    if (reports.length === 0) {
      console.log("No reports found for:", name);
      return res.status(404).json({ message: "No reports found." });
    }

    console.log("Reports found:", reports);
    res.json(reports);

  } catch (error) {
    console.error("Server Error in searchByName:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get only location points for pending and in-progress reports
router.get('/locations', async (req, res) => {
  try {
    const reports = await WasteReport.find(
      { status: { $in: ["Pending", "In Progress"] } }, // Only Pending + In Progress
      { location: 1, latitude: 1, longitude: 1, status: 1 } // Return only these fields
    );

    res.json(reports);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Upload photo to Cloudinary
router.post("/upload-photo", authMiddleware, upload.single("photo"), handleMulterError, async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("Request headers:", req.headers);
    console.log("Request body:", req.body);
    
    // Check if file exists
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded" 
      });
    }

    // Validate file properties
    if (!req.file.originalname || !req.file.mimetype) {
      console.log("Invalid file properties:", req.file);
      return res.status(400).json({ 
        success: false,
        message: "Invalid file properties" 
      });
    }

    // Log the file details
    console.log("File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: req.file.path, // Use path instead of url
      public_id: req.file.public_id || req.file.filename, // Fallback to filename
      buffer: req.file.buffer ? 'Buffer exists' : 'No buffer'
    });

    // Validate Cloudinary response
    if (!req.file.path) {
      console.error("Invalid Cloudinary response - no path:", req.file);
      throw new Error("Invalid response from Cloudinary - no file path");
    }

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.public_id || req.file.filename
    });
  } catch (error) {
    console.error("Upload error details:", error);
    res.status(500).json({ 
      success: false,
      message: "Error uploading file",
      error: error.message
    });
  }
});

module.exports = router; 