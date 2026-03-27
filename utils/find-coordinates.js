/**
 * PDF Coordinate Finder Utility
 * 
 * This script creates a test PDF with a grid overlay to help you find
 * exact coordinates for text placement on your admit card template.
 * 
 * Usage: node utils/find-coordinates.js
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createCoordinateGrid() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    console.log('📏 Creating coordinate grid...\n');
    console.log(`Page dimensions: ${width} x ${height} points (A4)`);
    console.log('(0,0) is at bottom-left corner\n');

    // Draw grid lines every 50 points
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Add X coordinate labels
      if (x > 0) {
        page.drawText(`X:${x}`, {
          x: x + 2,
          y: height - 20,
          size: 8,
          color: rgb(0, 0, 1),
        });
      }
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Add Y coordinate labels
      if (y > 0) {
        page.drawText(`Y:${y}`, {
          x: 10,
          y: y + 2,
          size: 8,
          color: rgb(1, 0, 0),
        });
      }
    }

    // Draw border
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      borderColor: rgb(0, 0, 0),
      thickness: 2,
    });

    // Add title
    page.drawText('PDF Coordinate Grid - A4', {
      x: 200,
      y: height - 50,
      size: 16,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0, 0, 0),
    });

    // Add instructions
    const instructionFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText('Use this grid to find exact coordinates for text placement', {
      x: 50,
      y: height - 80,
      size: 10,
      font: instructionFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText('Each grid square = 50 x 50 points', {
      x: 50,
      y: height - 100,
      size: 10,
      font: instructionFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Add sample text with coordinates at common positions
    page.drawText('Sample Coordinates:', {
      x: 50,
      y: height - 130,
      size: 12,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      color: rgb(0, 0.4, 0.8),
    });

    const samplePoints = [
      { label: 'Top-Left (for labels)', x: 50, y: height - 160 },
      { label: 'Center-Right (for values)', x: 260, y: height - 190 },
      { label: 'Middle area', x: 120, y: height - 220 },
    ];

    samplePoints.forEach((point, index) => {
      // Draw crosshair marker
      const markerSize = 10;
      page.drawLine({
        start: { x: point.x - markerSize, y: point.y },
        end: { x: point.x + markerSize, y: point.y },
        thickness: 1,
        color: rgb(1, 0, 0),
      });
      page.drawLine({
        start: { x: point.x, y: point.y - markerSize },
        end: { x: point.x, y: point.y + markerSize },
        thickness: 1,
        color: rgb(1, 0, 0),
      });

      // Draw coordinate text
      page.drawText(`${point.label}: (${point.x}, ${point.y})`, {
        x: point.x + 15,
        y: point.y,
        size: 9,
        font: instructionFont,
        color: rgb(1, 0, 0),
      });
    });

    // Mark common reference points with circles and coordinates
    const referencePoints = [
      { name: 'Label Area', x: 100, y: height - 250, desc: '(for "Name:", "Mobile No:")' },
      { name: 'Value Area', x: 260, y: height - 300, desc: '(for actual values)' },
      { name: 'Center', x: width / 2, y: height / 2, desc: '(middle of page)' },
      { name: 'Bottom Instructions', x: 100, y: 380, desc: '(for instructions)' },
    ];

    referencePoints.forEach(point => {
      // Draw a circle
      page.drawCircle({
        x: point.x,
        y: point.y,
        size: 8,
        borderColor: rgb(1, 0, 0),
        thickness: 1,
      });
      
      // Add label
      page.drawText(`${point.name}: (${point.x}, ${point.y})`, {
        x: point.x + 15,
        y: point.y + 5,
        size: 9,
        font: instructionFont,
        color: rgb(1, 0, 0),
      });

      // Add description below
      page.drawText(point.desc, {
        x: point.x + 15,
        y: point.y - 10,
        size: 8,
        font: instructionFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    // Add ruler markings along edges
    // X-axis markers (bottom)
    for (let x = 0; x <= width; x += 100) {
      page.drawLine({
        start: { x, y: 20 },
        end: { x, y: 30 },
        thickness: 1,
        color: rgb(0, 0, 1),
      });
      page.drawText(`${x}`, {
        x: x - 5,
        y: 10,
        size: 8,
        color: rgb(0, 0, 1),
      });
    }

    // Y-axis markers (left side)
    for (let y = 0; y <= height; y += 100) {
      page.drawLine({
        start: { x: 20, y },
        end: { x: 30, y },
        thickness: 1,
        color: rgb(0, 1, 0),
      });
      page.drawText(`${y}`, {
        x: 5,
        y: y + 3,
        size: 8,
        color: rgb(0, 1, 0),
      });
    }

    // Save the PDF
    const outputPath = path.join(__dirname, '..', 'coordinate-grid.pdf');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log('✅ Grid PDF created successfully!\n');
    console.log(`📁 Output file: ${outputPath}`);
    console.log('\n📋 How to use:');
    console.log('   1. Open coordinate-grid.pdf');
    console.log('   2. Note the grid lines (each square = 50 points)');
    console.log('   3. Identify where you want to place text');
    console.log('   4. Read the X,Y coordinates from the grid labels');
    console.log('   5. Update FIELD_POSITIONS in utils/generatePDF.js');
    console.log('\n💡 Tip: PDF coordinates start from bottom-left (0,0)');
    console.log('   X increases as you move right');
    console.log('   Y increases as you move up\n');

  } catch (error) {
    console.error('❌ Error creating grid:', error);
    process.exit(1);
  }
}

// Run the utility
createCoordinateGrid();
