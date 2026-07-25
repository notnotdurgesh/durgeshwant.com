/**
 * One-shot (re-runnable) raster asset optimiser.
 *
 * Every PNG/JPEG under `public/assets` and `src/data/blogs` is resized to a
 * sensible ceiling for the size it is actually displayed at, re-encoded as
 * WebP, and the original is removed. Run it again after dropping new images in.
 *
 *   npx tsx scripts/optimize-images.ts
 *
 * Source references (.md / .json / .ts / .tsx) use the `.webp` extension.
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCAN_DIRS = ['public/assets', 'src/data/blogs'];
const RASTER = /\.(png|jpe?g)$/i;

/** Longest-edge ceiling, most specific path fragment first. */
const MAX_EDGE: Array<[RegExp, number]> = [
  [/[/\\]experience[/\\]/, 256],   // company logos, rendered at 48-80 CSS px
  [/[/\\]books[/\\]/, 720],        // book covers in the reading-list post
  [/skills-photo/, 512],           // circular avatar, max 112 CSS px
  [/about-image/, 1400],           // portrait card
];
const DEFAULT_MAX_EDGE = 1600;     // full-bleed banners and screenshots

const QUALITY = 82;

function maxEdgeFor(file: string): number {
  for (const [pattern, edge] of MAX_EDGE) {
    if (pattern.test(file)) return edge;
  }
  return DEFAULT_MAX_EDGE;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (RASTER.test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    files.push(...(await walk(path.join(ROOT, dir))));
  }

  let before = 0;
  let after = 0;

  for (const file of files.sort()) {
    const target = file.replace(RASTER, '.webp');
    const original = await fs.stat(file);
    const meta = await sharp(file).metadata();
    const edge = maxEdgeFor(file);

    const pipeline = sharp(file);
    if (Math.max(meta.width ?? 0, meta.height ?? 0) > edge) {
      pipeline.resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true });
    }

    await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(target);

    const out = await fs.stat(target);
    before += original.size;
    after += out.size;

    const saved = (1 - out.size / original.size) * 100;
    const next = await sharp(target).metadata();
    console.log(
      `${(original.size / 1024).toFixed(0).padStart(6)}KB -> ${(out.size / 1024).toFixed(0).padStart(5)}KB ` +
      `(-${saved.toFixed(0).padStart(2)}%)  ${meta.width}x${meta.height} -> ${next.width}x${next.height}  ` +
      path.relative(ROOT, target)
    );

    await fs.unlink(file);
  }

  console.log(
    `\nTotal: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB ` +
    `(-${((1 - after / before) * 100).toFixed(1)}%) across ${files.length} images`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
