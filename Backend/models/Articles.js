const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  excerpt: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }
});

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
