#!/usr/bin/env node
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImages } from './build-images.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(ROOT, 'public', 'map');
mkdirSync(dest, { recursive: true });
copyFileSync(
  join(ROOT, 'node_modules', 'world-atlas', 'countries-110m.json'),
  join(dest, 'countries-110m.json')
);
console.log('map data copied to public/map/');
const images = await buildImages(join(ROOT, 'public'));
console.log(`Static images: ${images.sources} sources, ${images.variants} WebP variants, ${(images.bytes / 1048576).toFixed(1)} MiB`);
