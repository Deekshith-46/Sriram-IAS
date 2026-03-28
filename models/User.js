const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  city: String,
  
  // New fields for multi-sheet support
  venue: String,
  gsSlot: String,        // General Studies slot
  csat: String,          // CSAT slot
  examSheet: String      // Sheet name (e.g., "PUNE SLOT 1")
});

module.exports = mongoose.model("User", userSchema);
