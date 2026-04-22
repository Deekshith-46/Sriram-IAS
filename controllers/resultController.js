const ResultGS = require("../models/ResultGS");
const ResultCSAT = require("../models/ResultCSAT");

// Get GS (Paper 1) Result
exports.getGS = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Mobile number required" });
    }

    console.log("\n🔍 [GS] Searching for mobile:", phone);

    // 🔥 Use regex for flexible matching (handles spaces, dots, etc.)
    const user = await ResultGS.findOne({
      mobile: { $regex: `^${phone}$`, $options: "i" }
    }).lean();

    if (!user) {
      console.log("❌ [GS] NOT FOUND for:", phone);
      
      // Debug: Show sample mobiles from DB
      const sampleData = await ResultGS.find().limit(5).select('mobile name').lean();
      console.log("📊 [GS] Sample mobiles in DB:", sampleData.map(u => u.mobile));
      
      return res.status(404).json({ message: "GS result not found" });
    }

    // 🆕 Get total count of GS students
    const totalCount = await ResultGS.countDocuments({});
    
    console.log("✅ [GS] Found user:", user.name, "| Mobile:", user.mobile);
    
    // Add total count to response
    res.json({
      ...user,
      totalStudents: totalCount
    });
  } catch (error) {
    console.error("❌ [GS] Error:", error);
    res.status(500).json({ 
      message: "Error fetching GS result", 
      error: error.message 
    });
  }
};

// Get CSAT (Paper 2) Result
exports.getCSAT = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Mobile number required" });
    }

    console.log("\n🔍 [CSAT] Searching for mobile:", phone);

    // 🔥 Use regex for flexible matching (handles spaces, dots, etc.)
    const user = await ResultCSAT.findOne({
      mobile: { $regex: `^${phone}$`, $options: "i" }
    }).lean();

    if (!user) {
      console.log("❌ [CSAT] NOT FOUND for:", phone);
      
      // Debug: Show sample mobiles from DB
      const sampleData = await ResultCSAT.find().limit(5).select('mobile name').lean();
      console.log("📊 [CSAT] Sample mobiles in DB:", sampleData.map(u => u.mobile));
      
      return res.status(404).json({ message: "CSAT result not found" });
    }

    console.log("✅ [CSAT] Found user:", user.name, "| Mobile:", user.mobile);
    
    // Determine CSAT qualification status
    const qualified = user.score >= 66.67;
    
    res.json({
      ...user,
      status: qualified ? 'Qualified' : 'Not Qualified'
    });
  } catch (error) {
    console.error("❌ [CSAT] Error:", error);
    res.status(500).json({ 
      message: "Error fetching CSAT result", 
      error: error.message 
    });
  }
};



// Get ALL Results (GS and CSAT separated by sheet)
exports.getAllResults = async (req, res) => {
  try {
    console.log("\n📊 [ALL RESULTS] Fetching complete GS and CSAT data...");
    
    // Fetch all GS results
    const gsResults = await ResultGS.find({})
      .sort({ rank: 1, score: -1 })
      .lean();
    
    // Fetch all CSAT results
    const csatResults = await ResultCSAT.find({})
      .sort({ score: -1 })
      .lean();
    
    // Group GS data by sheet
    const gsBySheet = {};
    gsResults.forEach(record => {
      const sheetName = record.sheetName || 'Unknown';
      if (!gsBySheet[sheetName]) {
        gsBySheet[sheetName] = [];
      }
      gsBySheet[sheetName].push(record);
    });
    
    // Group CSAT data by sheet
    const csatBySheet = {};
    csatResults.forEach(record => {
      const sheetName = record.sheetName || 'Unknown';
      if (!csatBySheet[sheetName]) {
        csatBySheet[sheetName] = [];
      }
      csatBySheet[sheetName].push(record);
    });
    
    console.log(`✅ [ALL RESULTS] Found ${gsResults.length} GS and ${csatResults.length} CSAT records`);
    
    res.json({
      success: true,
      gs: gsBySheet,
      csat: csatBySheet,
      totals: {
        gs: gsResults.length,
        csat: csatResults.length
      }
    });
  } catch (error) {
    console.error("❌ [ALL RESULTS] Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching results", 
      error: error.message 
    });
  }
};

// Get Results by Center
exports.getResultsByCenter = async (req, res) => {
  try {
    const { centre } = req.query;
    
    if (!centre) {
      return res.status(400).json({ 
        success: false,
        message: "Centre parameter is required" 
      });
    }
    
    console.log(`\n📊 [BY CENTER] Fetching results for centre: ${centre}`);
    
    // Fetch GS results for the centre
    const gsResults = await ResultGS.find({ 
      centre: { $regex: centre, $options: 'i' } 
    })
      .sort({ rank: 1, score: -1 })
      .lean();
    
    // Fetch CSAT results for the centre
    const csatResults = await ResultCSAT.find({ 
      centre: { $regex: centre, $options: 'i' } 
    })
      .sort({ score: -1 })
      .lean();
    
    console.log(`✅ [BY CENTER] Found ${gsResults.length} GS and ${csatResults.length} CSAT records`);
    
    res.json({
      success: true,
      centre,
      gs: gsResults,
      csat: csatResults,
      totals: {
        gs: gsResults.length,
        csat: csatResults.length
      }
    });
  } catch (error) {
    console.error("❌ [BY CENTER] Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching results by centre", 
      error: error.message 
    });
  }
};

// Get ONLINE Results (GS and CSAT)
exports.getOnlineResults = async (req, res) => {
  try {
    console.log("\n📊 [ONLINE] Fetching ONLINE GS and CSAT data...");
    
    // Fetch ONLINE GS results
    const gsOnline = await ResultGS.find({ mode: 'Online' })
      .sort({ rank: 1, score: -1 })
      .lean();
    
    // Fetch ONLINE CSAT results
    const csatOnline = await ResultCSAT.find({ mode: 'Online' })
      .sort({ score: -1 })
      .lean();
    
    console.log(`✅ [ONLINE] Found ${gsOnline.length} GS and ${csatOnline.length} CSAT online records`);
    
    res.json({
      success: true,
      gsOnline,
      csatOnline,
      totals: {
        gsOnline: gsOnline.length,
        csatOnline: csatOnline.length
      }
    });
  } catch (error) {
    console.error("❌ [ONLINE] Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching online results", 
      error: error.message 
    });
  }
};
