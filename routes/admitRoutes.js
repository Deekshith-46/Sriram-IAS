const express = require("express");
const User = require("../models/User");
const { generateAdmitCard } = require("../utils/generatePDF");

const router = express.Router();

// 🔍 TEST ROUTE - Verify server is responding
router.get("/test", (req, res) => {
  res.json({ message: "Admit routes are active!" });
});

router.get("/download", async (req, res) => {
  try {
    // 🔍 Normalize email (case-insensitive)
    const email = req.query.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ Case-insensitive email matching using regex
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    }).lean(); // 🔥 CRITICAL: Returns plain JS object, not Mongoose document

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and send PDF with lean object (no toObject needed)
    generateAdmitCard(user, res);
    
  } catch (error) {
    res.status(500).json({ message: "Error downloading admit card", error: error.message });
  }
});

module.exports = router;
