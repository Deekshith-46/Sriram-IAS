const express = require("express");
const { verifyLogin } = require("../controllers/authController");

const router = express.Router();

// Login verification endpoint (phone + email)
router.post("/verify-login", verifyLogin);

// Legacy OTP endpoints (commented out)
// router.post("/login", login);
// router.post("/verify-otp", verifyOTP);

module.exports = router;
