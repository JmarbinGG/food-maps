#!/usr/bin/env node
/**
 * Copy canonical JSX from backend/ai/{assistant,common,food}/ into frontend/nouri/src/.
 * Run from repo root: node frontend/nouri/scripts/sync-from-ai.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const srcRoot = path.join(repoRoot, 'backend', 'ai');
const destRoot = path.join(repoRoot, 'frontend', 'nouri', 'src');
const folders = ['assistant', 'common', 'food'];

let copied = 0;
let skipped = 0;

for (const folder of folders) {
  const fromDir = path.join(srcRoot, folder);
  const toDir = path.join(destRoot, folder);
  if (!fs.existsSync(fromDir)) {
    console.warn('Skip missing:', fromDir);
    continue;
  }
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    if (!name.endsWith('.jsx')) continue;
    const from = path.join(fromDir, name);
    const to = path.join(toDir, name);
    const content = fs.readFileSync(from, 'utf8');
    const existing = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : null;
    if (existing === content) {
      skipped += 1;
      continue;
    }
    fs.writeFileSync(to, content, 'utf8');
    copied += 1;
    console.log('synced', path.relative(repoRoot, to));
  }
}

console.log(`Done: ${copied} updated, ${skipped} unchanged`);
