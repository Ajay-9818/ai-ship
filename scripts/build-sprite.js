#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const svgstore = require('svgstore');

const RAW_DIR = path.resolve(__dirname, '../src/icons/raw');
const TOOLS_DIR = path.resolve(__dirname, '../src/icons/raw/tools');
const OUTPUT_DIR = path.resolve(__dirname, '../src/_includes');
const SPRITE_PATH = path.join(OUTPUT_DIR, 'sprite.svg');

function buildSprite() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Raw icon directory not found: ${RAW_DIR}`);
    process.exit(1);
  }

  const sprites = svgstore({ inline: true });
  let iconCount = 0;

  // 读取根目录下的静态 UI 图标
  const rootFiles = fs.existsSync(RAW_DIR) 
    ? fs.readdirSync(RAW_DIR).filter((file) => file.endsWith('.svg'))
    : [];
  
  rootFiles.forEach((file) => {
    const source = fs.readFileSync(path.join(RAW_DIR, file), 'utf8');
    const symbolId = `icon-${path.basename(file, '.svg')}`;
    sprites.add(symbolId, source);
    iconCount++;
  });

  // 读取 tools 子目录下的工具图标
  const toolFiles = fs.existsSync(TOOLS_DIR)
    ? fs.readdirSync(TOOLS_DIR).filter((file) => file.endsWith('.svg'))
    : [];
  
  toolFiles.forEach((file) => {
    const source = fs.readFileSync(path.join(TOOLS_DIR, file), 'utf8');
    const symbolId = `icon-${path.basename(file, '.svg')}`;
    sprites.add(symbolId, source);
    iconCount++;
  });

  if (iconCount === 0) {
    console.warn('No SVG icons found to build sprite.');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(SPRITE_PATH, '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n');
    return;
  }

  const result = sprites.toString({ pretty: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(SPRITE_PATH, result, 'utf8');
  console.log(`Sprite generated with ${iconCount} icons → ${SPRITE_PATH}`);
  console.log(`  - Static UI icons: ${rootFiles.length}`);
  console.log(`  - Tool icons: ${toolFiles.length}`);
}

buildSprite();
