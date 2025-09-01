
const mongoose = require("mongoose");

const wasteReportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    required: true,
    enum: ["Plastic Waste (Bottles, bags, packaging, etc.)", 
      "Paper Waste (Newspapers, books, cardboard, etc.)", 
      "Glass Waste (Bottles, jars, broken glass, etc.)", 
      "Metal Waste (Cans, aluminum foil, scrap metal, etc.)", 
      "Organic Waste (Food scraps, garden waste, compostable items)", 
      "E-Waste (Old electronics, batteries, wires, etc.)", 
      "Hazardous Waste (Chemicals, medical waste, toxic materials)", 
      "Textile Waste (Clothes, fabric scraps, shoes, etc.)", 
      "Construction Waste (Bricks, cement, wood, tiles, etc.)", 
      "Mixed Waste (General household waste that cannot be sorted)"]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  reporterName: {
    type: String,
    default: "Anonymous",
    trim: true
  },
  reportDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "In Progress", "Resolved"]
  },
  photos: [{
    url: String,
    public_id: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("WasteReport", wasteReportSchema, "wastereports");
