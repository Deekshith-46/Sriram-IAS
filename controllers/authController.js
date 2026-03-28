const User = require("../models/User");

// Verify login credentials (phone + email)
exports.verifyLogin = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone || !email) {
      return res.status(400).json({ 
        message: "Phone number and email are required" 
      });
    }

    // Find user with matching phone AND email
    const user = await User.findOne({ phone, email });

    if (!user) {
      return res.status(404).json({ 
        message: "User not found. Please check your credentials." 
      });
    }

    // Return user data (without sensitive fields)
    res.json({
      message: "Login successful!",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredMode: user.preferredMode,
        city: user.city,
        timestamp: user.timestamp,
        gsPaperSlot: user.gsPaperSlot
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error verifying credentials", 
      error: error.message 
    });
  }
};

// Authentication endpoints temporarily disabled
// OTP email sending feature has been removed

// exports.login = async (req, res) => {
//   // Login logic removed
// };

// exports.verifyOTP = async (req, res) => {
//   // Verification logic removed
// };
