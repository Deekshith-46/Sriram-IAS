const xlsx = require("xlsx");
const User = require("../models/User");
const ResultGS = require("../models/ResultGS");
const ResultCSAT = require("../models/ResultCSAT");

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    const { type } = req.body; // 'user' for admit card, 'gs' for GS result, 'csat' for CSAT result

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Route to appropriate handler based on type
    if (type === 'gs') {
      return await uploadResultExcel(file, ResultGS, 'GS', res);
    } else if (type === 'csat') {
      return await uploadResultExcel(file, ResultCSAT, 'CSAT', res);
    } else {
      // Default: Upload admit card data (existing logic)
      return await uploadAdmitCardExcel(file, res);
    }

  } catch (err) {
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message 
    });
  }
};

// Helper function to upload result Excel (GS or CSAT)
async function uploadResultExcel(file, Model, typeName, res) {
  const workbook = xlsx.readFile(file.path);
  
  let allData = [];
  
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
      range: 0
    });
    
    const enrichedData = data.map(row => ({
      ...row,
      sheetName
    }));
    
    allData.push(...enrichedData);
  });

  const results = allData.map((row, index) => {
    const normalizeKey = (key) =>
      key.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    const cleanRow = {};
    Object.keys(row).forEach((key) => {
      const normalized = normalizeKey(key);
      cleanRow[normalized] = row[key];
    });

    // Debug: Log first few rows to see what we're getting
    if (index < 3) {
      console.log(`\n📊 Row ${index} - Normalized Keys:`, Object.keys(cleanRow));
      console.log(`   Mobile field value: "${cleanRow['mobno'] || cleanRow['mobile'] || cleanRow['phone']}"`);
      console.log(`   Name field value: "${cleanRow['name'] || cleanRow['candidateName']}"`);
    }

    return {
      mobile: String(
        cleanRow["mobile"] || 
        cleanRow["phone"] || 
        cleanRow["mobno"] || 
        cleanRow["mobileno"] || 
        cleanRow["mobno."] ||   // Handle "Mob No."
        cleanRow["phonenumber"] || 
        cleanRow["phoneno"] || 
        cleanRow["phoneno."] ||
        ""
      )
      .replace(/\D/g, "")   // 🔥 REMOVE ALL NON-DIGIT CHARACTERS (spaces, dots, dashes)
      .trim(),
      name: (
        cleanRow["name"] || 
        cleanRow["candidateName"] || 
        cleanRow["candidatename"] || 
        cleanRow["studentname"] || 
        cleanRow["studentName"] ||
        ""
      ).trim(),
      centre: (
        cleanRow["centre"] || 
        cleanRow["center"] || 
        cleanRow["examcentre"] || 
        cleanRow["examcenter"] || 
        cleanRow["examCentre"] ||
        ""
      ).trim(),
      correct: parseInt(cleanRow["correct"] || 0),
      incorrect: parseInt(cleanRow["incorrect"] || 0),
      blank: parseInt(cleanRow["blank"] || 0),
      score: parseFloat(cleanRow["score"] || 0)
    };
  });

  // Filter and log
  const validResults = results.filter(r => r.mobile);
  console.log(`\n✅ Total rows processed: ${results.length}`);
  console.log(`✅ Rows with valid mobile: ${validResults.length}`);
  console.log(`✅ Rows filtered out (no mobile): ${results.length - validResults.length}`);

  const operations = validResults.map(result => ({
      updateOne: {
        filter: { mobile: result.mobile },
        update: { $set: result },
        upsert: true
      }
    }));

  const result = await Model.bulkWrite(operations);

  res.json({
    message: `${typeName} result upload processed successfully 🚀`,
    totalSheets: workbook.SheetNames.length,
    sheetsProcessed: workbook.SheetNames,
    totalRows: allData.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount
  });
}

// Helper function to upload admit card Excel (existing logic)
async function uploadAdmitCardExcel(file, res) {
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
}

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;
    const { type } = req.body; // 'user' for admit card, 'gs' for GS result, 'csat' for CSAT result

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Route to appropriate handler based on type
    if (type === 'gs') {
      return await uploadResultExcel(file, ResultGS, 'GS', res);
    } else if (type === 'csat') {
      return await uploadResultExcel(file, ResultCSAT, 'CSAT', res);
    } else {
      // Default: Upload admit card data (existing logic)
      return await uploadAdmitCardExcel(file, res);
    }

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
