const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const admitRoutes = require("./routes/admitRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/admit", admitRoutes);
app.use("/result", resultRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Anubhuti II Backend API is running!",
    frontend: "http://localhost:5000",
    endpoints: {
      auth: {
        verifyLogin: "POST /auth/verify-login"
      },
      admin: {
        getAllUsers: "GET /admin/users",
        upload: "POST /admin/upload",
        search: "GET /admin/search?query=..."
      },
      admit: {
        download: "GET /admit/download?email=..."
      }
    }
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
