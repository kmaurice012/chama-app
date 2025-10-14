const fs = require('fs');
const path = require('path');

// Simple function to generate SVG icons
function generateSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="${size * 0.4}"
    font-weight="bold"
    fill="white"
  >CH</text>
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${size * 0.4}"
    fill="none"
    stroke="white"
    stroke-width="${size * 0.05}"
  />
</svg>`;
}

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating SVG placeholder icons...');

sizes.forEach(size => {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Created ${filename}`);
});

// Also create a favicon
const favicon = generateSVGIcon(32);
fs.writeFileSync(path.join(iconsDir, '../favicon.svg'), favicon);
console.log('✓ Created favicon.svg');

console.log('\n✅ All icons generated successfully!');
console.log('📝 Note: These are SVG placeholders. For production, replace with PNG icons.');
