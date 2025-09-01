const express = require("express");
const Article = require("../models/Articles");

const router = express.Router(); // Add this line to define the router

// ✅ 1. Create a new article
router.post("/add", async (req, res) => {
  try {
    const { title, image, excerpt, date, category, author } = req.body;

    if (!title || !image || !excerpt || !date || !category || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newArticle = new Article({ title, image, excerpt, date, category, author });
    await newArticle.save();

    res.status(201).json({ message: "Article added successfully", article: newArticle });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ 2. Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 }); // Sort by latest date
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching articles", error: error.message });
  }
});

// ✅ 3. Get a single article by ID
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Error fetching article", error: error.message });
  }
});

// ✅ 4. Delete an article
router.delete("/:id", async (req, res) => {
  try {
    const deletedArticle = await Article.findByIdAndDelete(req.params.id);
    if (!deletedArticle) return res.status(404).json({ message: "Article not found" });

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting article", error: error.message });
  }
});

// ✅ 5. Update article status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'declined'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "Article status updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: "Error updating article status", error: error.message });
  }
});

module.exports = router; // Make sure to export the router
