const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  name: String,
  centre: String,
  correct: Number,
  incorrect: Number,
  blank: Number,
  score: Number,
  rank: Number,  // 🆕 NEW FIELD for GS only
  timestamp: { type: Date, default: Date.now }
});

// Index for faster lookups
resultSchema.index({ mobile: 1 });

module.exports = mongoose.model("ResultGS", resultSchema);
