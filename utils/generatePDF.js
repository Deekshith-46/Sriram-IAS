const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateAdmitCard = (user, res) => {
  try {
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
    const rowHeight = 25;

    const drawRow = (label, value) => {
      // Draw borders
      doc.rect(tableX, tableY, 200, rowHeight).stroke();
      doc.rect(tableX + 200, tableY, 250, rowHeight).stroke();

      // Draw label
      doc
        .fontSize(12)
        .fillColor("#4A6FB5")
        .text(label, tableX + 10, tableY + 7, { width: 180 });

      // Draw value
      doc
        .fillColor("black")
        .text(value || "", tableX + 210, tableY + 7, { width: 230 });

      tableY += rowHeight;
    };

    drawRow("Name", user.name);
    drawRow("Mobile No.", user.phone);
    drawRow("Venue of Examination", `${user.city} (${user.preferredMode})`);

    doc.moveDown(2);

    // ================= EXAM TIMING TABLE =================
    // Parse dynamic timings (FINAL FIX)
    let gsTiming = "N/A";
    let csatTiming = "N/A";

    // Helper function to format timing (add missing AM/PM)
    const formatTiming = (time) => {
      if (!time || time === "N/A") return "N/A";

      const parts = time.split("-");

      if (parts.length !== 2) return time;

      let start = parts[0].trim();
      let end = parts[1].trim();

      // Check if end already has AM/PM
      if (!/AM|PM/i.test(end)) {
        if (/PM/i.test(start)) {
          end += " PM";
        } else if (/AM/i.test(start)) {
          end += " AM";
        }
      }

      return `${start} - ${end}`;
    };

    if (user.gsPaperSlot) {
      const parts = user.gsPaperSlot.split(",");

      // ===== Paper I =====
      if (parts[0]) {
        let gsPart = parts[0];

        // Remove "Slot X:"
        gsPart = gsPart.split(":").slice(1).join(":");

        // Remove text
        gsPart = gsPart.replace("(General Studies)", "").trim();

        gsTiming = formatTiming(gsPart);
      }

      // ===== Paper II =====
      if (parts[1]) {
        let csatPart = parts[1];

        csatPart = csatPart.replace("(CSAT)", "").trim();

        csatTiming = formatTiming(csatPart);
      }
    }

    let examX = 100;  // Adjusted for better alignment with top table
    let examY = doc.y;
    const colWidth = 200;

    const drawExamRow = (col1, col2, isHeader = false) => {
      // Draw borders
      doc.rect(examX, examY, colWidth, rowHeight).stroke();
      doc.rect(examX + colWidth, examY, colWidth, rowHeight).stroke();

      // Draw text
      if (isHeader) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }

      doc.text(col1, examX + 10, examY + 7, { width: colWidth - 20 });
      doc.text(col2, examX + colWidth + 10, examY + 7, { width: colWidth - 20 });

      examY += rowHeight;
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
    console.error("PDF generation error:", error);
    res.status(500).json({
      message: "Error generating admit card",
      error: error.message
    });
  }
};
