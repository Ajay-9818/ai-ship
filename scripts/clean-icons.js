#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.resolve(__dirname, '../src/icons/raw/tools');

function cleanToolIcons() {
  if (!fs.existsSync(TOOLS_DIR)) {
    console.log('⚠️  Tools directory does not exist: ' + TOOLS_DIR);
    return;
  }

  const files = fs.readdirSync(TOOLS_DIR).filter((file) => file.endsWith('.svg'));
  
  if (files.length === 0) {
    console.log('✓ Tools directory is already clean (no SVG files found)');
    return;
  }

  console.log(`🗑️  Cleaning tool icons from ${TOOLS_DIR}...\n`);
  
  let deletedCount = 0;
  files.forEach((file) => {
    const filePath = path.join(TOOLS_DIR, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`  ✓ Deleted: ${file}`);
      deletedCount++;
    } catch (error) {
      console.error(`  ✗ Failed to delete ${file}: ${error.message}`);
    }
  });

  console.log(`\n✅ Cleaned ${deletedCount} tool icon(s)`);
}

cleanToolIcons();
