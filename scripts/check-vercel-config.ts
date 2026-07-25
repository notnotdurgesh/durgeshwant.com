/**
 * Validates vercel.json before it can reach a deploy.
 *
 * Vercel validates this file with `additionalProperties: false` on every route
 * entry, and a violation fails the *build* — not the config parse, the whole
 * deploy. A `"//"` key used as a comment (JSON has no comments) took the site's
 * build down with:
 *
 *   The `vercel.json` schema validation failed: `headers[0]` should NOT have
 *   additional property `//`
 *
 * The allowed key sets below are taken from https://openapi.vercel.sh/vercel.json.
 * They are inlined rather than fetched so the check works offline and cannot
 * itself become a build-time network dependency.
 *
 *   npx tsx scripts/check-vercel-config.ts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ROUTE_KEYS: Record<string, string[]> = {
  rewrites: ['source', 'destination', 'transforms', 'has', 'missing', 'statusCode', 'env', 'respectOriginCacheControl'],
  redirects: ['source', 'destination', 'permanent', 'statusCode', 'has', 'missing'],
  headers: ['source', 'headers', 'has', 'missing'],
};

const TOP_LEVEL = [
  '$schema', 'buildCommand', 'cleanUrls', 'crons', 'devCommand', 'framework',
  'functions', 'git', 'headers', 'ignoreCommand', 'images', 'installCommand',
  'outputDirectory', 'public', 'redirects', 'regions', 'rewrites', 'routes',
  'trailingSlash',
];

async function main() {
  const file = path.join(ROOT, 'vercel.json');
  let config: Record<string, unknown>;

  try {
    config = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    console.error(`vercel.json is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }

  const problems: string[] = [];

  for (const key of Object.keys(config)) {
    if (!TOP_LEVEL.includes(key)) problems.push(`unknown top-level key: "${key}"`);
  }

  for (const [section, allowed] of Object.entries(ROUTE_KEYS)) {
    const entries = config[section];
    if (!Array.isArray(entries)) continue;

    entries.forEach((entry: Record<string, unknown>, i) => {
      for (const key of Object.keys(entry)) {
        if (!allowed.includes(key)) {
          problems.push(`${section}[${i}] has disallowed property "${key}" (allowed: ${allowed.join(', ')})`);
        }
      }
      if (typeof entry.source !== 'string') {
        problems.push(`${section}[${i}] is missing a string "source"`);
      }
    });
  }

  // Header values have their own shape and are easy to get subtly wrong.
  const headers = config.headers;
  if (Array.isArray(headers)) {
    headers.forEach((entry: { headers?: unknown }, i) => {
      if (!Array.isArray(entry.headers)) {
        problems.push(`headers[${i}].headers must be an array of { key, value }`);
        return;
      }
      entry.headers.forEach((h: Record<string, unknown>, j) => {
        const extra = Object.keys(h).filter((k) => k !== 'key' && k !== 'value');
        if (extra.length) problems.push(`headers[${i}].headers[${j}] has disallowed property "${extra[0]}"`);
        if (typeof h.key !== 'string' || typeof h.value !== 'string') {
          problems.push(`headers[${i}].headers[${j}] needs string "key" and "value"`);
        }
      });
    });
  }

  if (problems.length) {
    console.error('\nvercel.json would be rejected by Vercel:\n');
    for (const p of problems) console.error(`  ${p}`);
    console.error('\nJSON has no comments — Vercel rejects "//" keys. Explain config in the commit message instead.\n');
    process.exit(1);
  }

  const counts = ['rewrites', 'redirects', 'headers']
    .filter((k) => Array.isArray(config[k]))
    .map((k) => `${(config[k] as unknown[]).length} ${k}`)
    .join(', ');
  console.log(`vercel.json is valid (${counts}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
