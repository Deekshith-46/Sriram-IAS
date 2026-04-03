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
