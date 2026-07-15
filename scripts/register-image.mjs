#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [sourceArg, ...args] = process.argv.slice(2);

function flag(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function findEntryFile(id) {
  const dir = join(ROOT, 'data', 'entries');
  for (const tradition of readdirSync(dir)) {
    const file = join(dir, tradition, `${id}.json`);
    if (existsSync(file)) return file;
  }
  throw new Error(`entry ${id} not found`);
}

function pixelSize(file) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  return {
    width: Number(output.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight: (\d+)/)?.[1]),
  };
}

function usage() {
  console.log(
    'usage: register-image.mjs <source> --entry <id> --title <title> --artist <artist> --license <license> --source-url <url> [--replace]',
  );
}

try {
  if (!sourceArg) {
    usage();
    process.exit(1);
  }

  const source = resolve(sourceArg);
  const entryId = flag('--entry');
  const sourceTitle = flag('--title');
  const artist = flag('--artist');
  const license = flag('--license');
  const sourceUrl = flag('--source-url');
  const replace = args.includes('--replace');

  if (!entryId || !sourceTitle || !artist || !license || !sourceUrl) {
    usage();
    process.exit(1);
  }
  if (!existsSync(source) || !statSync(source).isFile()) throw new Error(`source file not found: ${source}`);
  if (!/^[a-z0-9-]+$/.test(entryId)) throw new Error(`invalid entry id: ${entryId}`);

  const entryFile = findEntryFile(entryId);
  const entry = JSON.parse(readFileSync(entryFile, 'utf8'));
  const outDir = join(ROOT, 'public', 'images', 'entries');
  const final = join(outDir, `${entryId}.jpg`);
  const tempImage = join(outDir, `.${entryId}.registering.jpg`);
  const tempEntry = `${entryFile}.registering`;

  if (!replace && (existsSync(final) || entry.image)) {
    throw new Error(`${entryId} already has an image; pass --replace to replace it`);
  }

  mkdirSync(outDir, { recursive: true });
  const sourceSize = pixelSize(source);
  const resize = Math.max(sourceSize.width, sourceSize.height) > 1000 ? ['--resampleHeightWidthMax', '1000'] : [];

  try {
    execFileSync(
      'sips',
      ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', ...resize, source, '--out', tempImage],
      { stdio: 'pipe' },
    );
    const { width, height } = pixelSize(tempImage);
    if (!width || !height || width < 380) throw new Error(`output is too small or unreadable: ${width}x${height}`);

    entry.image = {
      file: `/images/entries/${entryId}.jpg`,
      sourceUrl,
      sourceTitle,
      artist,
      license,
      width,
      height,
    };
    writeFileSync(tempEntry, `${JSON.stringify(entry, null, 2)}\n`);
    renameSync(tempImage, final);
    renameSync(tempEntry, entryFile);
    console.log(`OK ${entryId} <- ${basename(source)} (${width}x${height}, ${license})`);
  } catch (error) {
    if (existsSync(tempImage)) unlinkSync(tempImage);
    if (existsSync(tempEntry)) unlinkSync(tempEntry);
    throw error;
  }
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exit(1);
}
