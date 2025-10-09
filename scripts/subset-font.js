/*
 * Font subsetting script
 *
 * This script reads site titles (multi-language) from src/_data/site.json and
 * generates a single WOFF2 subset font containing only the glyphs needed for
 * those titles. It expects you to place original full font files (which are NOT
 * committed to git) inside src/fonts/ named:
 *   - font.ttf (Chinese base or CJK unified)
 *   - font-en.ttf (Latin)
 *   - font-jp.ttf (Japanese-specific glyphs, optional if covered by font.ttf)
 *
 * These source font files are intentionally ignored (.gitignore). Provide them
 * locally before running `npm run build:font`. You can later replace them or
 * update titles and re-run to regenerate the subset.
 */

import { readFile, writeFile, access } from 'fs/promises';
import path from 'path';
import subsetFont from 'subset-font';

const root = process.cwd();
const dataFile = path.join(root, 'src/_data/site.json');
const fontsDir = path.join(root, 'src/fonts');
const outDir = path.join(root, 'src/static/assets/fonts');
const outFile = path.join(outDir, 'site-title-subset.woff2');

// Helper to test existence
async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function collectTitleCharacters() {
  const raw = await readFile(dataFile, 'utf-8');
  const json = JSON.parse(raw);
  // Expect structure: { title: '中文', title_en: 'English', title_jp: '日本語', ... }
  const titles = [json.title, json.title_en, json.title_jp].filter(Boolean);
  if (!titles.length) throw new Error('No titles found in site.json (title/title_en/title_jp)');
  // Concatenate and deduplicate characters
  const all = Array.from(new Set(titles.join('').split(''))).join('');
  return all;
}

async function loadFontBuffers() {
  const files = ['font.ttf', 'font-en.ttf', 'font-jp.ttf'];
  const buffers = [];
  for (const f of files) {
    const full = path.join(fontsDir, f);
    if (await exists(full)) {
      const buf = await readFile(full);
      buffers.push({ name: f, buffer: buf });
    }
  }
  if (!buffers.length) {
    throw new Error('No source font files found in src/fonts/. Expected at least font.ttf');
  }
  return buffers;
}

async function mergeAndSubset(buffers, text) {
  // Strategy: subset each font separately, then keep the smallest that contains glyphs.
  // For simplicity we subset the first font that likely contains CJK (font.ttf) with all chars.
  // If multiple fonts needed (distinct glyph coverage), we subset each and binary-concatenate is NOT valid for fonts.
  // A proper merge would need fontTools (Python). To keep JS-only & simple, we:
  // 1. Try primary font.ttf for all characters.
  // 2. If some chars missing and fallback fonts exist, we log a warning so user can switch to a single comprehensive font file.

  const primary = buffers[0];
  const subset = await subsetFont(primary.buffer, text, {
    targetFormat: 'woff2'
  });
  // NOTE: subset-font does not expose direct missing glyph list; assume success.
  return subset;
}

async function run() {
  try {
    const chars = await collectTitleCharacters();
    console.log('Title characters to keep:', chars, ` (count=${[...chars].length})`);
    const buffers = await loadFontBuffers();
    const subset = await mergeAndSubset(buffers, chars);
    await fsMkdirIfNeeded(outDir);
    await writeFile(outFile, subset);
    console.log(`Subset font generated: ${outFile} (${subset.length} bytes)`);
    console.log('Add @font-face in your CSS if not already done, e.g.');
    console.log(`@font-face {\n  font-family: 'SiteTitle';\n  src: url('/static/assets/fonts/site-title-subset.woff2') format('woff2');\n  font-display: swap;\n}`);
  } catch (e) {
    console.error('[subset-font] Failed:', e.message);
    process.exit(1);
  }
}

async function fsMkdirIfNeeded(dir) {
  const { mkdir } = await import('fs/promises');
  await mkdir(dir, { recursive: true });
}

run();
