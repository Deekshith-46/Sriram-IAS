const express = require("express");
const multer = require("multer");
const { uploadExcel, getAllUsers, searchUsers } = require("../controllers/adminController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadExcel);
router.get("/users", getAllUsers); // Get all users
router.get("/search", searchUsers);

module.exports = router;
