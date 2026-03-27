const express = require("express");
const User = require("../models/User");
const { generateAdmitCard } = require("../utils/generatePDF");

const router = express.Router();

router.get("/download", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and send PDF
    generateAdmitCard(user, res);
    
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Error downloading admit card", error: error.message });
  }
});

module.exports = router;
