/**
 * Fix Routing Conflicts Script
 * 
 * This script removes files that are causing Next.js routing conflicts.
 * Run with: node scripts/fix-routing-conflicts.js
 */

const fs = require('fs');
const path = require('path');

// Files that need to be removed to fix routing conflicts
const filesToRemove = [
  'pages/donors/[id]/index.js',
  'pages/api/inventory/storage/temperature/index.js'
];

// Create the scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Function to delete a file with proper error handling
function deleteFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Successfully deleted: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${filePath}:`, error.message);
    return false;
  }
}

// Process each file
console.log('🔧 Starting routing conflict fix...');
const results = filesToRemove.map(file => deleteFile(file));

// Check if the parent directories are now empty and can be removed
const directoriesToCheck = [
  'pages/donors/[id]',
  'pages/api/inventory/storage/temperature'
];

directoriesToCheck.forEach(dirPath => {
  try {
    const fullPath = path.join(process.cwd(), dirPath);
    
    // Check if directory exists
    if (fs.existsSync(fullPath)) {
      // Get directory contents
      const files = fs.readdirSync(fullPath);
      
      // If directory is empty, delete it
      if (files.length === 0) {
        fs.rmdirSync(fullPath);
        console.log(`✅ Removed empty directory: ${dirPath}`);
      } else {
        console.log(`ℹ️ Directory not empty, keeping: ${dirPath} (contains ${files.length} files)`);
      }
    }
  } catch (error) {
    console.error(`❌ Error checking directory ${dirPath}:`, error.message);
  }
});

// Summary
const successCount = results.filter(Boolean).length;
console.log('\n📊 Summary:');
console.log(`Total files processed: ${filesToRemove.length}`);
console.log(`Successfully deleted: ${successCount}`);
console.log(`Failed to delete: ${filesToRemove.length - successCount}`);

console.log('\n✨ Routing conflict fix complete!');
console.log('You can now restart your Next.js server to see if the warnings are gone.');
