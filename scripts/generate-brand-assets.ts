/**
 * Generates the social cards and app icons that have to be real raster files:
 *
 *   public/og/default.jpg      1200x630 site-wide Open Graph card
 *   public/og/<slug>.jpg       1200x630 card per blog post, from its banner
 *   public/icons/icon-<n>.png  192/512 PWA icons
 *   public/icons/apple-touch-icon.png   180x180
 *   public/icons/favicon-32.png
 *
 * OG images are JPEG on purpose: several link unfurlers (LinkedIn, WhatsApp)
 * still do not render WebP, and the rest of the site's imagery is WebP.
 *
 *   npx tsx scripts/generate-brand-assets.ts
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/data/blogs');
const OG_DIR = path.join(ROOT, 'public/og');
const ICON_DIR = path.join(ROOT, 'public/icons');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** Brand mark: dark disc, "R" in cream, "D." in tan. Matches the site favicon. */
const markSvg = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#12100e"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="42">
    <tspan fill="#fdfbf7">R</tspan><tspan fill="#d4a373">D.</tspan>
  </text>
</svg>`;

/** Site-wide social card, typeset in the site's own palette. */
const defaultCardSvg = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="22%" r="62%">
      <stop offset="0%" stop-color="#d4a373" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="#a3b18a" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#12100e" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#12100e"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="24" y="24" width="1152" height="582" rx="18" fill="none"
        stroke="#d4a373" stroke-opacity="0.22" stroke-width="1.5"/>

  <!-- brand mark -->
  <rect x="84" y="92" width="82" height="82" rx="20" fill="#1c1917" stroke="#d4a373" stroke-opacity="0.35"/>
  <text x="125" y="134" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="35">
    <tspan fill="#fdfbf7">R</tspan><tspan fill="#d4a373">D.</tspan>
  </text>

  <text x="84" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="88"
        font-weight="400" fill="#fdfbf7" letter-spacing="-2">Reddy Durgeshwant</text>

  <text x="88" y="366" font-family="Georgia, 'Times New Roman', serif" font-size="46"
        font-style="italic" fill="#d4a373">Full Stack &amp; AI Engineer</text>

  <line x1="88" y1="428" x2="308" y2="428" stroke="#d4a373" stroke-opacity="0.5" stroke-width="2"/>

  <text x="88" y="486" font-family="Helvetica, Arial, sans-serif" font-size="25"
        fill="#a8a096" letter-spacing="0.5">Scalable web systems, AI integration, and interfaces</text>
  <text x="88" y="524" font-family="Helvetica, Arial, sans-serif" font-size="25"
        fill="#a8a096" letter-spacing="0.5">that feel considered.</text>

  <text x="1116" y="556" text-anchor="end" font-family="Helvetica, Arial, sans-serif"
        font-size="22" fill="#d4a373" letter-spacing="4">DURGESHWANT.COM</text>
</svg>`;

async function ogFromImage(source: string, target: string) {
  await sharp(source)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(target);
  const { size } = await fs.stat(target);
  console.log(`  ${path.relative(ROOT, target).padEnd(44)} ${(size / 1024).toFixed(0)}KB`);
}

async function main() {
  await fs.mkdir(OG_DIR, { recursive: true });
  await fs.mkdir(ICON_DIR, { recursive: true });

  console.log('Open Graph cards (1200x630 JPEG):');
  // The site-wide card is typeset rather than photographic: the previous default
  // (about-image) is third-party fan art carrying the artist's signature, which
  // is not something to put on every shared link of a professional portfolio.
  const defaultCard = path.join(OG_DIR, 'default.jpg');
  await sharp(Buffer.from(defaultCardSvg())).jpeg({ quality: 90, mozjpeg: true }).toFile(defaultCard);
  console.log(`  ${path.relative(ROOT, defaultCard).padEnd(44)} ${((await fs.stat(defaultCard)).size / 1024).toFixed(0)}KB`);

  for (const slug of await fs.readdir(BLOG_DIR)) {
    const metaPath = path.join(BLOG_DIR, slug, 'meta.json');
    try {
      await fs.access(metaPath);
    } catch {
      continue;
    }
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf8')) as { banner?: string };
    const banner = meta.banner
      ? path.join(BLOG_DIR, slug, meta.banner.replace(/^\.?\//, ''))
      : path.join(ROOT, 'public/assets/about-image.webp');
    await ogFromImage(banner, path.join(OG_DIR, `${slug}.jpg`));
  }

  console.log('\nIcons:');
  const icons: Array<[string, number]> = [
    ['favicon-32.png', 32],
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ];
  for (const [name, size] of icons) {
    const target = path.join(ICON_DIR, name);
    await sharp(Buffer.from(markSvg(size))).png({ compressionLevel: 9 }).toFile(target);
    const { size: bytes } = await fs.stat(target);
    console.log(`  ${path.relative(ROOT, target).padEnd(44)} ${size}x${size}  ${(bytes / 1024).toFixed(1)}KB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
