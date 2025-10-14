# PWA Icons for ChamaHub

## Required Icon Sizes

The following icon sizes are required for full PWA support:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (Apple Touch Icon)
- 192x192 (Android)
- 384x384
- 512x512 (Splash screen)

## How to Generate Icons

### Option 1: Use an Online Tool (Recommended)
1. Create a 512x512 PNG icon with your logo
2. Use [PWA Asset Generator](https://progressier.com/pwa-icons-and-ios-splash-screen-generator)
3. Upload your 512x512 image
4. Download all generated icons
5. Place them in this `/public/icons` directory

### Option 2: Use ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run:
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

### Option 3: Use Figma/Photoshop
1. Design your icon at 512x512 resolution
2. Export at each required size
3. Ensure proper padding and centering
4. Save as PNG with transparency

## Design Guidelines

- **Minimum padding**: 10% on all sides
- **Safe area**: Keep important elements within 80% of the canvas
- **Background**: Use solid color or transparent
- **Format**: PNG with alpha channel
- **Color**: Use your brand colors (Green #10b981 for ChamaHub)

## Current Status

⚠️ **Icons need to be generated!**

To quickly get started, you can use a placeholder service:
1. Go to https://via.placeholder.com/512/10b981/ffffff?text=CH
2. Right-click and save as `icon-512x512.png`
3. Use Option 2 above to generate all sizes

Or create a proper branded icon for production use.

## Maskable Icons

For Android 13+ and adaptive icons, ensure your icon works well with masking:
- Design with a 20% safe zone
- Test at https://maskable.app/editor
- Icon content should be within the center 80% of the canvas
