#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');

const RAW_DIR = path.resolve(__dirname, '../src/icons/raw');
const OUTPUT_DIR = path.resolve(__dirname, '../src/_includes');
const SPRITE_PATH = path.join(OUTPUT_DIR, 'sprite.svg');

function buildSprite() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Raw icon directory not found: ${RAW_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(RAW_DIR).filter((file) => file.endsWith('.svg'));
  if (files.length === 0) {
    console.warn('No SVG icons found to build sprite.');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(SPRITE_PATH, '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n');
    return;
  }

  const sprites = svgstore({ inline: true });

  files.forEach((file) => {
    const source = fs.readFileSync(path.join(RAW_DIR, file), 'utf8');
    const symbolId = `icon-${path.basename(file, '.svg')}`;
    sprites.add(symbolId, source);
  });

  const result = sprites.toString({ pretty: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(SPRITE_PATH, result, 'utf8');
  console.log(`Sprite generated with ${files.length} icons → ${SPRITE_PATH}`);
}

buildSprite();
