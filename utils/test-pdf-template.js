/**
 * PDF Template Test Script
 * 
 * Tests if your PDF template is properly configured
 * Usage: node utils/test-pdf-template.js
 */

const fs = require('fs').promises;
const path = require('path');

async function testTemplate() {
  console.log('🔍 Testing PDF Template Setup...\n');

  // Check if templates folder exists
  const templatesDir = path.join(__dirname, '..', 'templates');
  
  try {
    await fs.access(templatesDir);
    console.log('✅ Templates folder exists');
  } catch (error) {
    console.log('❌ Templates folder NOT found');
    console.log('\n📁 Creating templates folder...');
    await fs.mkdir(templatesDir);
    console.log('✅ Folder created. Please place your PDF template in:');
    console.log(`   ${templatesDir}/admit-card-template.pdf\n`);
    return;
  }

  // Check if template PDF exists
  const templatePath = path.join(templatesDir, 'admit-card-template.pdf');
  
  try {
    const stats = await fs.stat(templatePath);
    console.log('✅ PDF template found!');
    console.log(`   Location: ${templatePath}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    
    // Verify it's a valid PDF
    const fileContent = await fs.readFile(templatePath);
    if (fileContent.slice(0, 5).toString() === '%PDF-') {
      console.log('✅ Valid PDF file detected\n');
    } else {
      console.log('⚠️  File may not be a valid PDF\n');
    }
    
  } catch (error) {
    console.log('❌ PDF template NOT found');
    console.log('\n📄 Please place your PDF template at:');
    console.log(`   ${templatePath}\n`);
    console.log('💡 Tip: The filename must be exactly "admit-card-template.pdf"\n');
    return;
  }

  // Check generatePDF.js configuration
  const generatePDFPath = path.join(__dirname, 'generatePDF.js');
  
  try {
    const content = await fs.readFile(generatePDFPath, 'utf8');
    
    if (content.includes('FIELD_POSITIONS')) {
      console.log('✅ FIELD_POSITIONS configuration found');
      
      // Extract and display current positions
      const positionsMatch = content.match(/const FIELD_POSITIONS = ({[\s\S]*?});/);
      if (positionsMatch) {
        console.log('\n📍 Current Field Positions:');
        console.log('─'.repeat(50));
        
        const fields = [
          'name', 'phone', 'email', 'preferredMode', 
          'city', 'venue', 'timing', 'instructions'
        ];
        
        fields.forEach(field => {
          const fieldMatch = positionsMatch[0].match(
            new RegExp(`${field}:\\s*{\\s*x:\\s*(\\d+),\\s*y:\\s*(\\d+),\\s*size:\\s*(\\d+)`)
          );
          if (fieldMatch) {
            const [, x, y, size] = fieldMatch;
            console.log(`   ${field.padEnd(15)} X:${x.padStart(3)}  Y:${y.padStart(3)}  Size:${size}`);
          }
        });
        
        console.log('─'.repeat(50));
        console.log('\n💡 To adjust positions, edit FIELD_POSITIONS in generatePDF.js\n');
      }
    } else {
      console.log('⚠️  FIELD_POSITIONS not found in generatePDF.js');
    }
    
  } catch (error) {
    console.log('❌ Could not read generatePDF.js');
  }

  // Check if coordinate grid exists
  const gridPath = path.join(__dirname, '..', 'coordinate-grid.pdf');
  
  try {
    await fs.access(gridPath);
    console.log('✅ Coordinate grid available');
    console.log(`   Location: ${gridPath}`);
    console.log('   Use this to find exact text positions!\n');
  } catch (error) {
    console.log('\n💡 Tip: Run coordinate finder for precise positioning:');
    console.log('   node utils/find-coordinates.js\n');
  }

  console.log('✨ Setup Complete!\n');
  console.log('📋 Next Steps:');
  console.log('   1. Ensure your PDF template is in place');
  console.log('   2. Update FIELD_POSITIONS based on your template layout');
  console.log('   3. Test with: npm start');
  console.log('   4. Download admit card from: http://localhost:5000/admit/download\n');
}

// Run the test
testTemplate().catch(console.error);
