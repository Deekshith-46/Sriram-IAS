const xlsx = require("xlsx");
const User = require("../models/User");

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // 🔥 VERY IMPORTANT FIX
    // raw: false → automatically converts Excel dates to readable format
    const data = xlsx.utils.sheet_to_json(sheet, {
      defval: "",   // prevent undefined
      raw: false    // convert Excel date automatically
    });

    console.log("✅ Excel Data Received:", JSON.stringify(data, null, 2));
    console.log("📊 RAW Column Names (before trim):", Object.keys(data[0] || {}));

    const users = data.map((row) => {
      const normalizeKey = (key) => key.toLowerCase().replace(/[\s-_]/g, "");
      
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        cleanRow[normalizeKey(key)] = row[key];
      });

      return {
        name: (cleanRow["name"] || "").trim(),
        phone: String(cleanRow["phonenumber"] || "").trim(),
        email: (cleanRow["emailid"] || "").toLowerCase().trim(),
        preferredMode: (cleanRow["preferredmode"] || "").trim(),
        city: (cleanRow["city"] || "").trim(),
        
        // ✅ FIXED timestamp - handles both numbers and strings
        timestamp: typeof cleanRow["timestamp"] === "number"
          ? new Date((cleanRow["timestamp"] - 25569) * 86400 * 1000).toLocaleString()
          : cleanRow["timestamp"] || "",
        
        gsPaperSlot: (cleanRow["gspaperislot"] || "").trim()
      };
    });

    // 🚀 BULK UPSERT - Single DB call (SUPER FAST)
    const operations = users
      .filter(u => u.email && u.phone)
      .map(user => ({
        updateOne: {
          filter: { email: user.email, phone: user.phone },
          update: { $set: user },
          upsert: true
        }
      }));

    const result = await User.bulkWrite(operations);

    res.json({
      message: "Upload processed SUPER FAST 🚀",
      total: users.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-otp -otpExpiry'); // Exclude sensitive fields
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch users", 
      error: error.message 
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query } },
        { email: { $regex: query, $options: "i" } }
      ]
    });

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};
