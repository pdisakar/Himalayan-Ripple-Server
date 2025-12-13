const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Test script to verify AVIF conversion is working
 * This creates a simple test image and converts it to AVIF
 */
async function testAVIFConversion() {
  console.log('🧪 Testing AVIF Conversion with Sharp...\n');

  try {
    // Create a simple test image (100x100 red square)
    const testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toBuffer();

    console.log('✅ Created test image (100x100 red square)');
    console.log(`   Original PNG size: ${(testImageBuffer.length / 1024).toFixed(2)} KB\n`);

    // Convert to AVIF
    const avifBuffer = await sharp(testImageBuffer)
      .avif({
        quality: 80,
        effort: 4,
        chromaSubsampling: '4:2:0'
      })
      .toBuffer();

    console.log('✅ Converted to AVIF successfully');
    console.log(`   AVIF size: ${(avifBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   Compression ratio: ${((1 - avifBuffer.length / testImageBuffer.length) * 100).toFixed(1)}% smaller\n`);

    // Save test file
    const testFilePath = path.join(__dirname, 'uploads', 'test-avif-conversion.avif');
    fs.writeFileSync(testFilePath, avifBuffer);
    console.log(`✅ Saved test file: ${testFilePath}\n`);

    // Verify file exists and is readable
    const fileStats = fs.statSync(testFilePath);
    console.log('✅ File verification:');
    console.log(`   File size: ${(fileStats.size / 1024).toFixed(2)} KB`);
    console.log(`   Created: ${fileStats.birthtime.toLocaleString()}\n`);

    // Test with a real-world scenario - find an existing image
    const uploadsDir = path.join(__dirname, 'uploads');
    const existingImages = fs.readdirSync(uploadsDir)
      .filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i))
      .slice(0, 1);

    if (existingImages.length > 0) {
      const existingImage = existingImages[0];
      const existingPath = path.join(uploadsDir, existingImage);
      const existingStats = fs.statSync(existingPath);
      
      console.log('🔄 Testing with existing image:');
      console.log(`   File: ${existingImage}`);
      console.log(`   Original size: ${(existingStats.size / 1024).toFixed(2)} KB`);

      const convertedBuffer = await sharp(existingPath)
        .avif({ quality: 80, effort: 4 })
        .toBuffer();

      const savings = ((1 - convertedBuffer.length / existingStats.size) * 100).toFixed(1);
      console.log(`   AVIF size: ${(convertedBuffer.length / 1024).toFixed(2)} KB`);
      console.log(`   Savings: ${savings}% smaller 🎉\n`);
    }

    console.log('✅ All tests passed! AVIF conversion is working correctly.\n');
    console.log('📝 Next steps:');
    console.log('   1. Test uploading an image through the admin panel');
    console.log('   2. Check that new uploads have .avif extension');
    console.log('   3. Verify file sizes are significantly smaller');
    console.log('   4. Confirm images display correctly in the browser\n');

  } catch (error) {
    console.error('❌ Error during AVIF conversion test:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   - Ensure Sharp is installed: npm install sharp');
    console.error('   - Check Node.js version (14+ required)');
    console.error('   - Verify uploads directory exists');
    process.exit(1);
  }
}

// Run the test
testAVIFConversion();
