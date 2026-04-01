const ResultGS = require("../models/ResultGS");
const ResultCSAT = require("../models/ResultCSAT");
const User = require("../models/User");

// Verify login credentials (mobile number only)
exports.verifyLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone (10 digits)
    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        message: "Invalid mobile number"
      });
    }

    console.log("🔍 [AUTH] Checking mobile:", phone);

    // Check in BOTH result collections (GS and CSAT)
    // Use regex for flexible matching (handles spaces, dots, etc.)
    const userGS = await ResultGS.findOne({
      mobile: { $regex: `^${phone}$`, $options: "i" }
    }).lean();
    
    const userCSAT = await ResultCSAT.findOne({
      mobile: { $regex: `^${phone}$`, $options: "i" }
    }).lean();

    // If not found in results, check admit cards (fallback)
    const userAdmit = await User.findOne({ phone: phone }).lean();

    if (!userGS && !userCSAT && !userAdmit) {
      console.log("❌ [AUTH] NOT FOUND:", phone);
      return res.status(401).json({
        message: "Mobile number not found"
      });
    }

    console.log("✅ [AUTH] Login successful:", phone);
    res.json({
      message: "Login successful!",
      phone: phone
    });

  } catch (error) {
    console.error("❌ [AUTH] Error:", error);
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
