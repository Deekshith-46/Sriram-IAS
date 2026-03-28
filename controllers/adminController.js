const xlsx = require("xlsx");
const User = require("../models/User");

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(file.path);
    
    // 🔥 READ ALL SHEETS (NOT JUST FIRST ONE)
    let allData = [];
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      
      const data = xlsx.utils.sheet_to_json(sheet, {
        defval: "",   // prevent undefined
        raw: false,   // convert Excel date automatically
        range: 0      // 🔥 FORCE FULL SHEET READ (fixes 500 row limit)
      });
      
      // Add sheet info to each row (VERY IMPORTANT)
      const enrichedData = data.map(row => ({
        ...row,
        sheetName // store sheet name like "PUNE SLOT 1"
      }));
      
      allData.push(...enrichedData);
    });

    const users = allData.map((row) => {
      // 🔥 STRONGER NORMALIZATION - removes EVERYTHING except letters & numbers
      const normalizeKey = (key) =>
        key
          .toLowerCase()
          .replace(/[^a-z0-9]/g, ""); // Remove all special chars, spaces, brackets, etc.
      
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        const normalized = normalizeKey(key);
        cleanRow[normalized] = row[key];
      });

      return {
        name: (cleanRow["name"] || "").trim(),
        phone: String(cleanRow["phonenumber"] || "").trim(),
        email: (cleanRow["emailid"] || "").toLowerCase().trim(),
        city: (cleanRow["city"] || "").trim(),
        
        // 🆕 NEW FIELDS - Multi-sheet support
        venue: (cleanRow["venue"] || "").trim(),
        
        // ✅ Handle multiple possible field names
        gsSlot: (
          cleanRow["generalstudiesslot"] ||
          cleanRow["gsslot"] ||
          cleanRow["gspaperislot"] ||
          ""
        ).trim(),
        
        csat: (
          cleanRow["csat"] ||
          cleanRow["csatslot"] ||
          ""
        ).trim(),
        
        examSheet: (cleanRow["sheetname"] || "").trim()
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
      totalSheets: workbook.SheetNames.length,
      sheetsProcessed: workbook.SheetNames,
      totalRows: allData.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    });

  } catch (err) {
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
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};
