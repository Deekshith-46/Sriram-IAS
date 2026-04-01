const express = require("express");
const multer = require("multer");
const { uploadExcel, getAllUsers, searchUsers } = require("../controllers/adminController");

const router = express.Router();

// Configure multer to accept file and handle additional fields
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res, next) => {
  // Multer puts non-file fields in req.body automatically when using .single()
  // The 'type' field will be in req.body.type
  next();
}, uploadExcel);
router.get("/users", getAllUsers); // Get all users
router.get("/search", searchUsers);

module.exports = router;
