#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../src/js/app.js');
const DEST_DIR = path.resolve(__dirname, '../src/static/assets');
const DEST = path.join(DEST_DIR, 'app.js');

function copy() {
  fs.mkdirSync(DEST_DIR, { recursive: true });
  fs.copyFileSync(SRC, DEST);
  console.log(`JS copied → ${DEST}`);
}

const shouldWatch = process.argv.includes('--watch');

copy();

if (shouldWatch) {
  fs.watch(SRC, { persistent: true }, (eventType) => {
    if (eventType === 'change') {
      try {
        copy();
      } catch (error) {
        console.error('Failed to copy JS', error);
      }
    }
  });
}
