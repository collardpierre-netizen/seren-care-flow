/**
 * Production-bundle integrity test.
 *
 * Builds the app in production mode and asserts that the Shop debug log
 * strings are completely stripped out. This guarantees that:
 *   - the `import.meta.env.DEV` guard at the call site is correctly
 *     constant-folded by Vite/esbuild,
 *   - the lazy field provider is dead-code eliminated,
 *   - no PII-adjacent debug field name leaks into the shipped JS.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(__dirname, '../../dist/assets');

const FORBIDDEN_STRINGS = [
  'mobility filter from profile',
  'profile_mobility_level',
  'applied_filter_tag',
  '[Shop]',
];

describe('production bundle strips Shop debug logs', () => {
  let bundleContents: string;

  beforeAll(() => {
    if (!existsSync(DIST_DIR)) {
      // Build only if a fresh dist isn't already available (CI / local).
      execSync('bunx vite build --mode production', {
        cwd: path.resolve(__dirname, '../..'),
        stdio: 'pipe',
      });
    }
    const jsFiles = readdirSync(DIST_DIR).filter(f => f.endsWith('.js'));
    bundleContents = jsFiles
      .map(f => readFileSync(path.join(DIST_DIR, f), 'utf8'))
      .join('\n');
  }, 120_000);

  it.each(FORBIDDEN_STRINGS)(
    'does not contain "%s" anywhere in the prod JS bundle',
    forbidden => {
      expect(bundleContents).not.toContain(forbidden);
    },
  );
});
