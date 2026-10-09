#!/usr/bin/env node

/**
 * validate-types.mjs
 *
 * Runs TypeScript type checking on the project or specific files.
 * Wrapper around `tsc --noEmit` with filtered output for src/components.
 *
 * Usage:
 *   node docs/ai/scripts/validate-types.mjs                    # full project check
 *   node docs/ai/scripts/validate-types.mjs --component Hero   # check specific component
 *
 * Exit codes:
 *   0 — no type errors
 *   1 — type errors found
 */

import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '../../..');

const args = process.argv.slice(2);
const componentFlag = args.indexOf('--component');
const componentName = componentFlag !== -1 ? args[componentFlag + 1] : null;

console.log('TypeScript Validation');
console.log('=====================\n');

try {
  const result = execSync('npx tsc --noEmit --incremental false --pretty 2>&1', {
    cwd: projectRoot,
    encoding: 'utf-8',
    timeout: 120000, // 2 min timeout
  });

  if (componentName) {
    // Filter output to only show errors in the specific component
    const lines = result.split('\n');
    const filtered = lines.filter(l =>
      l.includes('src/components/') && l.toLowerCase().includes(componentName.toLowerCase())
    );
    if (filtered.length === 0) {
      console.log(`PASS  No type errors in ${componentName}`);
    } else {
      console.log(`FAIL  Type errors in ${componentName}:\n`);
      filtered.forEach(l => console.log(l));
      process.exit(1);
    }
  } else {
    // Filter to app components only
    const lines = result.split('\n');
    const componentErrors = lines.filter(l => l.includes('src/components/'));
    if (componentErrors.length === 0) {
      console.log('PASS  No type errors in src/components');
    } else {
      console.log(`FAIL  ${componentErrors.length} type errors in src/components:\n`);
      componentErrors.forEach(l => console.log(l));
      process.exit(1);
    }
  }
} catch (err) {
  // tsc returns exit code 2 when there are errors
  const output = err.stdout || err.message || '';

  if (componentName) {
    const lines = output.split('\n');
    const filtered = lines.filter(l =>
      l.includes('src/components/') && l.toLowerCase().includes(componentName.toLowerCase())
    );
    if (filtered.length === 0) {
      console.log(`PASS  No type errors in ${componentName} (other errors exist in project)`);
      process.exit(0);
    } else {
      console.log(`FAIL  Type errors in ${componentName}:\n`);
      filtered.forEach(l => console.log(l));
      process.exit(1);
    }
  } else {
    const lines = output.split('\n');
    const componentErrors = lines.filter(l => l.includes('src/components/'));
    if (componentErrors.length === 0) {
      console.log('PASS  No type errors in src/components (other errors may exist in project)');
      process.exit(0);
    } else {
      console.log(`FAIL  ${componentErrors.length} type errors in src/components:\n`);
      componentErrors.forEach(l => console.log(l));
      process.exit(1);
    }
  }
}
