const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  name: String,
  centre: String,
  correct: Number,
  incorrect: Number,
  blank: Number,
  score: Number,
  rank: Number,  // Rank field for CSAT
  mode: String,  // Online/Offline
  sheetName: String,  // Track which sheet this came from
  timestamp: { type: Date, default: Date.now }
});

// Index for faster lookups
resultSchema.index({ mobile: 1 });

module.exports = mongoose.model("ResultCSAT", resultSchema);
