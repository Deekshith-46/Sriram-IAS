const xlsx = require("xlsx");
const User = require("../models/User");
const ResultGS = require("../models/ResultGS");
const ResultCSAT = require("../models/ResultCSAT");

exports.uploadExcel = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Always use multi-sheet handler (auto-detects GS and CSAT sheets)
    return await uploadResultMultiSheet(file, res);

  } catch (err) {
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message 
    });
  }
};

// Helper function to upload multi-sheet result Excel (GS & CSAT together)
async function uploadResultMultiSheet(file, res) {
  const workbook = xlsx.readFile(file.path);
  
  console.log("\n📊 Excel file loaded. Sheets found:", workbook.SheetNames);
  
  // Define sheet name mappings
  const gsSheets = ['NEW DELHI GS', 'PUNE GS', 'HYDERABAD GS', 'GS ONLINE'];
  const csatSheets = ['NEW DELHI CSAT', 'PUNE CSAT', 'HYDERABAD CSAT', 'CSAT ONLINE'];
  
  // Arrays to store data for each sheet
  const sheetData = {
    gs: { 'NEW DELHI GS': [], 'PUNE GS': [], 'HYDERABAD GS': [], 'GS ONLINE': [] },
    csat: { 'NEW DELHI CSAT': [], 'PUNE CSAT': [], 'HYDERABAD CSAT': [], 'CSAT ONLINE': [] }
  };
  
  let totalRowsProcessed = 0;
  let totalRowsSkipped = 0;
  
  // Process each sheet
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
      range: 0
    });
    
    console.log(`\n📄 Processing sheet: "${sheetName}" - ${data.length} rows`);
    
    // Normalize sheet name for matching
    const normalizedSheetName = sheetName.trim().toUpperCase();
    
    // Determine if this is GS or CSAT sheet
    let targetCollection = null;
    let targetSheetName = null;
    
    if (gsSheets.includes(normalizedSheetName)) {
      targetCollection = 'gs';
      targetSheetName = normalizedSheetName;
    } else if (csatSheets.includes(normalizedSheetName)) {
      targetCollection = 'csat';
      targetSheetName = normalizedSheetName;
    } else {
      console.log(`⚠️  Skipping unknown sheet: "${sheetName}"`);
      return;
    }
    
    // Process each row in the sheet
    data.forEach((row, index) => {
      const normalizeKey = (key) =>
        key.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        const normalized = normalizeKey(key);
        cleanRow[normalized] = row[key];
      });
      
      // Extract mobile number
      const mobile = String(
        cleanRow["mobno"] || 
        cleanRow["mobileno"] || 
        cleanRow["mobile"] || 
        cleanRow["phone"] || 
        cleanRow["phonenumber"] || 
        cleanRow["phoneno"] || 
        ""
      )
      .replace(/\D/g, "")
      .trim();
      
      // Skip rows without mobile number
      if (!mobile) {
        totalRowsSkipped++;
        return;
      }
      
      totalRowsProcessed++;
      
      // Check if this sheet has "Centre" field (offline sheets) or not (online sheets)
      const hasCentre = normalizedSheetName.includes('ONLINE') ? false : true;
      
      const resultData = {
        mobile: mobile,
        name: (
          cleanRow["candidatename"] || 
          cleanRow["name"] || 
          cleanRow["studentname"] || 
          ""
        ).trim(),
        correct: parseInt(cleanRow["correct"] || 0),
        incorrect: parseInt(cleanRow["incorrect"] || 0),
        blank: parseInt(cleanRow["blank"] || 0),
        score: parseFloat(cleanRow["score"] || 0),
        rank: parseInt(cleanRow["rank"] || 0) || null,
        mode: (cleanRow["mode"] || "").trim(),
        sheetName: sheetName.trim()  // Store original sheet name
      };
      
      // Debug: Log first row of each sheet to verify rank field
      if (index === 0) {
        console.log(`   📊 First row sample - Rank field: "${cleanRow['rank'] || 'NOT FOUND'}" | Parsed: ${resultData.rank}`);
      }
      
      // Add centre only for offline sheets
      if (hasCentre) {
        resultData.centre = (
          cleanRow["centre"] || 
          cleanRow["center"] || 
          ""
        ).trim();
      }
      
      // Store in appropriate array
      sheetData[targetCollection][targetSheetName].push(resultData);
    });
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL STATISTICS");
  console.log("=".repeat(60));
  console.log(`Total rows processed: ${totalRowsProcessed}`);
  console.log(`Total rows skipped (no mobile): ${totalRowsSkipped}`);
  console.log("=".repeat(60) + "\n");
  
  // Build detailed sheet statistics
  const gsSheetStats = {};
  const csatSheetStats = {};
  
  // Re-upload GS sheets and capture individual stats
  let gsTotalInserted = 0;
  let gsTotalUpdated = 0;
  
  for (const [sheetName, records] of Object.entries(sheetData.gs)) {
    if (records.length > 0) {
      console.log(`📤 Uploading ${records.length} records to GS collection - Sheet: "${sheetName}"`);
      
      const operations = records.map(result => ({
        updateOne: {
          filter: { mobile: result.mobile, sheetName: result.sheetName },
          update: { $set: result },
          upsert: true
        }
      }));
      
      const result = await ResultGS.bulkWrite(operations);
      
      gsSheetStats[sheetName] = {
        totalRecords: records.length,
        inserted: result.upsertedCount,
        updated: result.modifiedCount
      };
      
      gsTotalInserted += result.upsertedCount;
      gsTotalUpdated += result.modifiedCount;
      
      console.log(`   ✅ Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}\n`);
    }
  }
  
  // Re-upload CSAT sheets and capture individual stats
  let csatTotalInserted = 0;
  let csatTotalUpdated = 0;
  
  for (const [sheetName, records] of Object.entries(sheetData.csat)) {
    if (records.length > 0) {
      console.log(`📤 Uploading ${records.length} records to CSAT collection - Sheet: "${sheetName}"`);
      
      const operations = records.map(result => ({
        updateOne: {
          filter: { mobile: result.mobile, sheetName: result.sheetName },
          update: { $set: result },
          upsert: true
        }
      }));
      
      const result = await ResultCSAT.bulkWrite(operations);
      
      csatSheetStats[sheetName] = {
        totalRecords: records.length,
        inserted: result.upsertedCount,
        updated: result.modifiedCount
      };
      
      csatTotalInserted += result.upsertedCount;
      csatTotalUpdated += result.modifiedCount;
      
      console.log(`   ✅ Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}\n`);
    }
  }
  
  console.log("=".repeat(60));
  console.log("📊 DETAILED SHEET STATISTICS");
  console.log("=".repeat(60));
  
  console.log("\n📗 GS SHEETS:");
  for (const [sheetName, stats] of Object.entries(gsSheetStats)) {
    console.log(`   ${sheetName}: ${stats.totalRecords} rows | Inserted: ${stats.inserted} | Updated: ${stats.updated}`);
  }
  console.log(`   GS TOTAL: Inserted: ${gsTotalInserted} | Updated: ${gsTotalUpdated}\n`);
  
  console.log("📘 CSAT SHEETS:");
  for (const [sheetName, stats] of Object.entries(csatSheetStats)) {
    console.log(`   ${sheetName}: ${stats.totalRecords} rows | Inserted: ${stats.inserted} | Updated: ${stats.updated}`);
  }
  console.log(`   CSAT TOTAL: Inserted: ${csatTotalInserted} | Updated: ${csatTotalUpdated}\n`);
  console.log("=".repeat(60) + "\n");
  
  res.json({
    message: "Multi-sheet result upload completed successfully 🚀",
    sheetsProcessed: workbook.SheetNames,
    totalRowsProcessed: totalRowsProcessed,
    totalRowsSkipped: totalRowsSkipped,
    gs: {
      totalInserted: gsTotalInserted,
      totalUpdated: gsTotalUpdated,
      totalRecords: gsTotalInserted + gsTotalUpdated,
      sheets: gsSheetStats
    },
    csat: {
      totalInserted: csatTotalInserted,
      totalUpdated: csatTotalUpdated,
      totalRecords: csatTotalInserted + csatTotalUpdated,
      sheets: csatSheetStats
    }
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
