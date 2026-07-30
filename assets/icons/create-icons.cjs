const fs = require('fs');
const path = require('path');

// 1x1 blue PNG buffer
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const iconsDir = path.join(__dirname, '../../assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-16.png'), minimalPng);
fs.writeFileSync(path.join(iconsDir, 'icon-48.png'), minimalPng);
fs.writeFileSync(path.join(iconsDir, 'icon-128.png'), minimalPng);

console.log('Created extension icon assets: icon-16.png, icon-48.png, icon-128.png');
