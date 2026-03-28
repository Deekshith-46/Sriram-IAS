const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateAdmitCard = (user, res) => {
  try {
    // 🔍 HELPER FUNCTION: Clean empty/null/whitespace values
    const clean = (val) => {
      if (!val) return null;
      if (typeof val === "string" && val.trim() === "") return null;
      return val;
    };
    
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=admit-card-${user.name.replace(/\s+/g, "-")}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER IMAGE =================
    const headerPath = path.join(__dirname, "../public/Top.png");

    if (fs.existsSync(headerPath)) {
      doc.image(headerPath, {
        fit: [500, 100],
        align: "center"
      });
    }

    doc.moveDown(1);

    // ================= TITLES =================
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#4A6FB5")
      .text("ANUBHUTI II", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(18)
      .text("All India Open Mock Test", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(14)
      .text("e-Admit Card", { align: "center" });

    doc.moveDown(1.5);

    // ================= PERSONAL DETAILS TABLE =================
    const tableX = 80;
    let tableY = doc.y;

    const drawRow = (label, value) => {
      const labelWidth = 200;
      const valueWidth = 250;

      // 🔥 Calculate dynamic height based on content
      const labelHeight = doc.heightOfString(label, { width: labelWidth - 20 });
      const valueHeight = doc.heightOfString(value || "", { width: valueWidth - 20 });

      const dynamicHeight = Math.max(labelHeight, valueHeight) + 14;

      // Draw borders with dynamic height
      doc.rect(tableX, tableY, labelWidth, dynamicHeight).stroke();
      doc.rect(tableX + labelWidth, tableY, valueWidth, dynamicHeight).stroke();

      // Draw label
      doc
        .fontSize(12)
        .fillColor("#4A6FB5")
        .text(label, tableX + 10, tableY + 7, {
          width: labelWidth - 20
        });

      // Draw value (MULTILINE SUPPORT ✅)
      doc
        .fillColor("black")
        .text(value || "", tableX + labelWidth + 10, tableY + 7, {
          width: valueWidth - 20
        });

      // Move Y correctly
      tableY += dynamicHeight;
    };

    drawRow("Name", user.name);
    drawRow("Mobile No.", user.phone);
    
    // 🔍 CRITICAL FIX: Clean values properly (handle empty strings, spaces)
    const venue = clean(user.venue) || clean(user.Venue) || "N/A";
    drawRow("Venue of Examination", venue);

    doc.moveDown(2);

    // ================= EXAM TIMING TABLE =================
    // 🔍 CRITICAL FIX: Clean values before using
    // Handle field name variations + clean empty strings
    let gsTiming = clean(user.gsSlot) || clean(user.gs_slot) || clean(user.GSSlot) || clean(user.gsslot);
    let csatTiming = clean(user.csat) || clean(user.CSAT) || clean(user.csatSlot) || clean(user.csat_slot);

    // Format: "to" → "-"
    const format = (time) => {
      if (!time || time === "N/A") return "N/A";
      return time.replace(/\s*to\s*/i, " - ");
    };

    // Apply default ONLY after cleaning
    gsTiming = gsTiming ? format(gsTiming) : "N/A";
    csatTiming = csatTiming ? format(csatTiming) : "N/A";

    let examX = 100;  // Adjusted for better alignment with top table
    let examY = doc.y;
    const colWidth = 200;

    const drawExamRow = (col1, col2, isHeader = false) => {
      // 🔥 Calculate dynamic height based on content
      const col1Height = doc.heightOfString(col1, { width: colWidth - 20 });
      const col2Height = doc.heightOfString(col2, { width: colWidth - 20 });
      
      const dynamicHeight = Math.max(col1Height, col2Height) + 14;
      
      // Draw borders
      doc.rect(examX, examY, colWidth, dynamicHeight).stroke();
      doc.rect(examX + colWidth, examY, colWidth, dynamicHeight).stroke();

      // Draw text
      if (isHeader) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      doc.text(col1, examX + 10, examY + 7, { width: colWidth - 20 });
      doc.text(col2, examX + colWidth + 10, examY + 7, { width: colWidth - 20 });

      examY += dynamicHeight;
    };

    // Header row
    drawExamRow("Subject", "Timing", true);
    
    // Data rows with dynamic timings
    drawExamRow("Paper I (General Studies)", gsTiming || "N/A");
    drawExamRow("Paper II (CSAT)", csatTiming || "N/A");

    doc.moveDown(2);

    // ================= INSTRUCTIONS =================
    doc.moveDown(1);

    // ✅ Title perfectly centered
    const titleWidth = doc.widthOfString("INSTRUCTIONS");
    const titleX = (doc.page.width - titleWidth) / 2;
    
    doc
      .font("Helvetica-Bold")
      .fillColor("#4A6FB5")
      .fontSize(14)
      .text("INSTRUCTIONS", titleX, doc.y, {
        underline: true
      });

    doc.moveDown(1);

    // Set font
    doc.font("Helvetica").fontSize(11).fillColor("#4A6FB5");

    // Block settings
    const blockWidth = 480;
    const startX = (doc.page.width - blockWidth) / 2;

    const instructions = [
      "You must report at the Examination Center 30 minutes prior to the commencement of the exam.",
      "Candidates can give tests only at the assigned examination venue and allotted examination time.",
      "Fill Name, Mobile no. and other details carefully."
    ];

    instructions.forEach(text => {
      doc.text(`•  ${text}`, startX, doc.y, {
        width: blockWidth,
        align: "left",   // Left align inside centered block
        lineGap: 6
      });
      doc.moveDown(0.8);
    });

    // ================= FOOTER =================
    doc.moveDown(1);
    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#4A6FB5")
      .text("All the best!", { align: "center" });

    // ================= END =================
    doc.end();

  } catch (error) {
    res.status(500).json({
      message: "Error generating admit card",
      error: error.message
    });
  }
};
