const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  preferredMode: String,
  city: String,
  timestamp: String,
  gsPaperSlot: String
  // OTP fields removed - no longer needed
});

module.exports = mongoose.model("User", userSchema);
