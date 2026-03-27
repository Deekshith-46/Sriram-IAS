const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// ============================================
// 📍 FIELD POSITIONS - UPDATE THESE VALUES
// ============================================
// Coordinates are in points (1/72 inch)
// Origin (0,0) is at bottom-left of the page
// A4 size: 595 x 842 points

const FIELD_POSITIONS = {
  // ✅ PERFECT POSITIONS - Aligned to right side of labels
  name:        { x: 260, y: 700, size: 16, fontKey: 'bold' },
  
  phone:       { x: 260, y: 665, size: 14, fontKey: 'normal' },
  
  // ❌ REMOVED: email (not in template)
  // ❌ REMOVED: preferredMode (not in template)  
  // ❌ REMOVED: city (not in template)
  
  venue:       { x: 260, y: 630, size: 12, fontKey: 'normal' },
  
  timing:      { x: 120, y: 540, size: 11, fontKey: 'normal' },
  
  instructions:{ x: 100, y: 380, size: 10, fontKey: 'normal' }
};

// Font mapping
const FONTS = {
  normal: StandardFonts.Helvetica,
  bold: StandardFonts.HelveticaBold
};

// Color definitions (RGB values from 0 to 1)
const COLORS = {
  black: rgb(0, 0, 0),
  darkGray: rgb(0.3, 0.3, 0.3),
  blue: rgb(0, 0.4, 0.8)
};

exports.generateAdmitCard = async (user, res) => {
  try {
    // Check if template exists
    const templatePath = path.join(__dirname, '..', 'templates', 'admit-card-template.pdf');
    
    let pdfDoc;
    
    try {
      // Load existing PDF template
      const templateBytes = await fs.readFile(templatePath);
      pdfDoc = await PDFDocument.load(templateBytes);
      console.log('✅ Using custom PDF template');
    } catch (error) {
      // Template not found, create basic PDF
      console.log('⚠️  Template not found, creating basic PDF...');
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      
      // Add header
      page.drawText('ANUBHUTI II', {
        x: 220,
        y: 780,
        size: 24,
        font: StandardFonts.HelveticaBold,
        color: COLORS.blue,
      });
      
      page.drawText('Admit Card', {
        x: 240,
        y: 750,
        size: 18,
        font: StandardFonts.Helvetica,
      });
    }

    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Embed fonts and create font map
    const fonts = {
      normal: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    };

    // Prepare user data (only fields that exist in template)
    const userData = {
      name: user.name || 'N/A',
      phone: user.phone || 'N/A',
      venue: `${user.timestamp}, ${user.preferredMode}, ${user.city}`,
      timing: `Paper I (${user.gsPaperSlot || 'General Studies'}) - 9:30 AM - 11:30 AM\nPaper II (CSAT) - 2:30 PM - 4:30 PM`,
      instructions: [
        '1. Please arrive at the venue 30 minutes before the exam starts.',
        '2. Bring a valid photo ID proof along with this admit card.',
        '3. This admit card must be preserved in good condition.',
        '4. No electronic devices are allowed inside the examination hall.'
      ].join('\n')
    };

    // Draw text fields on the PDF (ONLY template fields)
    drawText(firstPage, 'name', userData.name, fonts, 16);
    drawText(firstPage, 'phone', userData.phone, fonts);
    drawText(firstPage, 'venue', userData.venue, fonts);
    drawText(firstPage, 'timing', userData.timing, fonts, 11);
    
    // Draw instructions with smaller line height
    const instructionLines = userData.instructions.split('\n');
    let currentY = FIELD_POSITIONS.instructions.y;
    instructionLines.forEach(line => {
      firstPage.drawText(line, {
        x: FIELD_POSITIONS.instructions.x,
        y: currentY,
        size: FIELD_POSITIONS.instructions.size,
        font: fonts.normal,
        color: COLORS.darkGray,
      });
      currentY -= 15; // Line spacing for instructions
    });

    // Save and send the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="admit-card-${user.name.replace(/\s+/g, '-')}.pdf"`
    );
    
    res.send(pdfBytes);
    console.log(`✅ Admit card generated for: ${user.name}`);

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({ 
      message: 'Error generating admit card', 
      error: error.message 
    });
  }
};

/**
 * Helper function to draw text at predefined positions
 */
function drawText(page, fieldKey, text, fonts, defaultSize = null) {
  const position = FIELD_POSITIONS[fieldKey];
  if (!position) {
    console.warn(`⚠️  Position not defined for field: ${fieldKey}`);
    return;
  }

  const size = defaultSize || position.size;
  
  // Get the actual font from the key
  const fontKey = position.fontKey || 'normal';
  const font = fonts[fontKey] || fonts.normal;
  
  // Handle multi-line text
  const lines = text.split('\n');
  let currentY = position.y;
  
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: position.x,
      y: currentY - (index * (size + 2)), // Adjust Y for each line
      size: size,
      font: font,
      color: COLORS.black,
    });
  });
}
