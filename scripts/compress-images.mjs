#!/usr/bin/env node
/* Re-compress every entry image to the display budget (max 1000px, JPEG q72)
   and refresh the width/height recorded in each entry JSON. Idempotent. */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = join(ROOT, 'public', 'images', 'entries');
const ENTRY_DIR = join(ROOT, 'data', 'entries');

const entryPath = new Map();
for (const tid of readdirSync(ENTRY_DIR)) {
  for (const f of readdirSync(join(ENTRY_DIR, tid))) {
    if (f.endsWith('.json')) entryPath.set(f.replace(/\.json$/, ''), join(ENTRY_DIR, tid, f));
  }
}

let before = 0;
let after = 0;
let n = 0;

for (const file of readdirSync(IMG_DIR).filter((f) => f.endsWith('.jpg'))) {
  const id = file.replace(/\.jpg$/, '');
  const img = join(IMG_DIR, file);
  before += statSync(img).size;

  execSync(`sips -s format jpeg -s formatOptions 72 --resampleHeightWidthMax 1000 "${img}" --out "${img}"`, {
    stdio: 'pipe',
  });
  after += statSync(img).size;
  n++;

  const dims = execSync(`sips -g pixelWidth -g pixelHeight "${img}"`, { encoding: 'utf8' });
  const width = Number(dims.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(dims.match(/pixelHeight: (\d+)/)?.[1]);

  const p = entryPath.get(id);
  if (!p || !existsSync(p)) {
    console.log(`WARN orphan image with no entry: ${file}`);
    continue;
  }
  const entry = JSON.parse(readFileSync(p, 'utf8'));
  if (entry.image) {
    entry.image.width = width;
    entry.image.height = height;
    writeFileSync(p, JSON.stringify(entry, null, 2) + '\n');
  }
}

const mb = (b) => (b / 1048576).toFixed(1);
console.log(`${n} images: ${mb(before)}MB -> ${mb(after)}MB`);
