#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOOL_ICONS_PATH = path.resolve(__dirname, '../src/_data/toolIcons.js');
const TOOLS_DIR = path.resolve(__dirname, '../src/icons/raw/tools');

// 确保目录存在
if (!fs.existsSync(TOOLS_DIR)) {
  fs.mkdirSync(TOOLS_DIR, { recursive: true });
}

// 加载工具图标配置
const toolIcons = require(TOOL_ICONS_PATH);

// 下载单个 SVG 文件
function downloadSvg(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TOOLS_DIR, filename);
    
    // 如果文件已存在，跳过下载
    if (fs.existsSync(filePath)) {
      console.log(`  ⏭️  Skipped (exists): ${filename}`);
      resolve();
      return;
    }

    const download = (downloadUrl) => {
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 200) {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            fs.writeFileSync(filePath, data, 'utf8');
            console.log(`  ✓ Downloaded: ${filename}`);
            resolve();
          });
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          // 处理重定向
          let redirectUrl = response.headers.location;
          // 如果是相对路径，转换为绝对路径
          if (redirectUrl.startsWith('/')) {
            const parsedUrl = new URL(downloadUrl);
            redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
          } else if (!redirectUrl.startsWith('http')) {
            redirectUrl = new URL(redirectUrl, downloadUrl).href;
          }
          download(redirectUrl);
        } else {
          reject(new Error(`Failed to download ${downloadUrl}: HTTP ${response.statusCode}`));
        }
      }).on('error', reject);
    };

    download(url);
  });
}

// 主函数
async function downloadAllIcons() {
  console.log('📥 Downloading external SVG icons...\n');
  
  const downloads = [];
  
  for (const [key, config] of Object.entries(toolIcons)) {
    if (key === '__default' || !config.svg) {
      continue;
    }
    
    const filename = `${key}.svg`;
    downloads.push(downloadSvg(config.svg, filename));
  }
  
  try {
    await Promise.all(downloads);
    console.log(`\n✅ Icon download complete! (${downloads.length} icons processed)`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error downloading icons: ${error.message}`);
    process.exit(1);
  }
}

downloadAllIcons();
