/**
 * Fails the build if a className in the source produces no CSS.
 *
 * Tailwind only emits rules for utilities it recognises. A typo, or a colour
 * token that was never declared in @theme, is not an error — the class is just
 * silently dropped and the element renders with whatever it inherited. That is
 * how `text-primary-foreground` and `text-muted-foreground` sat in this codebase
 * across five elements doing absolutely nothing.
 *
 * This walks every className in src/, strips the ones that are dynamic or
 * hand-written, and asserts each remaining token appears in the built CSS.
 *
 *   npm run build && npx tsx scripts/check-classes.ts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

/** Classes defined by hand in index.css or used only as JS/query hooks. */
const NON_UTILITY = new Set([
  'glass-panel', 'text-glow', 'text-glow-accent', 'font-hand',
  'custom-cursor-active', 'custom-cursor-dot', 'custom-cursor-ring',
  'project-panel', 'experience-item', 'stack-group', 'center-core',
  'skill-node', 'experience-bg-text', 'scroll-region',
  'prose', 'katex', 'katex-display', 'sidebar-open',
]);

/** Variant prefixes that Tailwind emits without the bare class ever appearing. */
const isProbablyFine = (token: string) =>
  // group/peer *names* (`group/code`) and data attributes are structural
  /^(group|peer)\//.test(token) ||
  // `prose-*` come from the typography plugin with generated names
  token.startsWith('prose-');

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Mirrors Tailwind's CSS class-name escaping closely enough to grep for. */
function escapeForCss(token: string): string {
  return token.replace(/[:./[\]()%,#!$&*+<=>?@^{|}~]/g, (c) => `\\${c}`);
}

async function main() {
  const cssFiles = (await fs.readdir(path.join(DIST, 'assets'))).filter((f) => f.endsWith('.css'));
  if (!cssFiles.length) {
    console.error('No built CSS found — run `npm run build` first.');
    process.exit(1);
  }
  const css = (
    await Promise.all(cssFiles.map((f) => fs.readFile(path.join(DIST, 'assets', f), 'utf8')))
  ).join('\n');

  const files = await walk(SRC);
  const missing = new Map<string, Set<string>>();
  let checked = 0;

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');

    // className="..." / className={`...`} / className={'...'}
    for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
      const raw = match[1] ?? match[2] ?? match[3] ?? '';

      // Drop interpolated segments; their contents are checked where literal.
      const literal = raw.replace(/\$\{[^}]*\}/g, ' ');

      for (const token of literal.split(/\s+/)) {
        if (!token || NON_UTILITY.has(token) || isProbablyFine(token)) continue;
        // Ternary fragments and stray punctuation from template splitting
        if (/^[?:'"`|&]/.test(token)) continue;

        checked++;
        if (!css.includes(`.${escapeForCss(token)}`)) {
          if (!missing.has(token)) missing.set(token, new Set());
          missing.get(token)!.add(path.relative(ROOT, file));
        }
      }
    }
  }

  if (missing.size === 0) {
    console.log(`All ${checked} class references resolve to emitted CSS.`);
    return;
  }

  console.error(`\n${missing.size} class(es) produce no CSS:\n`);
  for (const [token, where] of [...missing].sort()) {
    console.error(`  ${token.padEnd(42)} ${[...where].join(', ')}`);
  }
  console.error('\nEither the utility is misspelled or its theme token was never declared.');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
