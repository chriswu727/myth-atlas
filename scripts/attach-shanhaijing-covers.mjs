#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const entriesRoot = join(root, 'data', 'entries', 'shanhaijing');
const publicRoot = join(root, 'public');
const files = readdirSync(entriesRoot).filter((file) => file.endsWith('.json')).sort();

function readWebpDimensions(path) {
  const data = readFileSync(path);
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`Not a WebP image: ${path}`);
  }

  let offset = 12;
  while (offset + 8 <= data.length) {
    const type = data.toString('ascii', offset, offset + 4);
    const size = data.readUInt32LE(offset + 4);
    const payload = offset + 8;

    if (type === 'VP8 ') {
      return {
        width: data.readUInt16LE(payload + 6) & 0x3fff,
        height: data.readUInt16LE(payload + 8) & 0x3fff,
      };
    }

    if (type === 'VP8X') {
      return {
        width: data.readUIntLE(payload + 4, 3) + 1,
        height: data.readUIntLE(payload + 7, 3) + 1,
      };
    }

    if (type === 'VP8L') {
      const b1 = data[payload + 1];
      const b2 = data[payload + 2];
      const b3 = data[payload + 3];
      const b4 = data[payload + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }

    offset = payload + size + (size % 2);
  }

  throw new Error(`Could not read WebP dimensions: ${path}`);
}

for (const file of files) {
  const path = join(entriesRoot, file);
  const entry = JSON.parse(readFileSync(path, 'utf8'));
  const coverFile = `/images/entries/${entry.id}.webp`;
  const coverPath = join(publicRoot, coverFile);

  if (!existsSync(coverPath)) {
    throw new Error(`Missing generated cover for ${entry.id}: ${coverFile}`);
  }

  const { width, height } = readWebpDimensions(coverPath);

  entry.coverImage = {
    file: coverFile,
    sourceTitle: 'Myth Atlas Shanhaijing visual reconstruction',
    artist: 'Myth Atlas editorial · OpenAI image generation',
    license: 'Original editorial artwork',
    width,
    height,
  };

  writeFileSync(path, `${JSON.stringify(entry, null, 2)}\n`);
}

console.log(`Attached generated covers to ${files.length} Shanhaijing entries.`);
