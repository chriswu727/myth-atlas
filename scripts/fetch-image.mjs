#!/usr/bin/env node
/*
 * Wikimedia Commons image pipeline for Myth Atlas entries.
 *
 *   node scripts/fetch-image.mjs search "Zeus Otricoli bust"
 *   node scripts/fetch-image.mjs info "File:Jupiter Smyrna Louvre Ma13.jpg"
 *   node scripts/fetch-image.mjs fetch "File:Jupiter Smyrna Louvre Ma13.jpg" --entry zeus
 *   node scripts/fetch-image.mjs fetch "File:X.pdf" --entry hu-jiao --page 19 --crop 0.55,0.5,0.35,0.38
 *
 * Many Chinese woodblock bestiaries only exist on Commons as whole-book PDF
 * scans, several creatures to a leaf, so `--page` renders one page of the PDF
 * and `--crop` (fractions of that page: x,y,w,h) lifts a single figure out.
 *
 * `fetch` downloads the file, rejects tiny images (<20KB downloads are almost
 * always logos/icons, not artwork), compresses to max 1400px JPEG via sips,
 * saves to public/images/entries/<id>.jpg and writes the image block (with
 * attribution) into the entry's JSON. Idempotent: re-running replaces cleanly.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://commons.wikimedia.org/w/api.php';
// Cards render ~300px wide; a 380px scan is soft but honest, and beats an empty plate
// for the handful of legends whose only depiction is a small archival scan.
const MIN_WIDTH = 380;
const UA = 'MythAtlasBot/1.0 (https://github.com/chriswu727/myth-atlas; yichenwu727@gmail.com)';

const [cmd, arg, ...rest] = process.argv.slice(2);

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function stripHtml(s) {
  return (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function search(query) {
  const data = await api({
    action: 'query',
    list: 'search',
    srsearch: `${query} filetype:bitmap`,
    srnamespace: '6',
    srlimit: '12',
  });
  const hits = data.query?.search ?? [];
  for (const h of hits) console.log(h.title);
  if (hits.length === 0) console.log('(no results)');
}

async function info(fileTitle, pdfPage) {
  const data = await api({
    action: 'query',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: pdfPage ? '2000' : '1400',
    ...(pdfPage ? { iiurlparam: `page${pdfPage}-2000px` } : {}),
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) {
    console.log(JSON.stringify({ error: 'not found' }));
    return null;
  }
  const md = ii.extmetadata ?? {};
  const out = {
    title: page.title,
    width: ii.width,
    height: ii.height,
    thumbUrl: ii.thumburl ?? ii.url,
    descriptionUrl: ii.descriptionurl,
    license: stripHtml(md.LicenseShortName?.value),
    artist: stripHtml(md.Artist?.value),
    objectName: stripHtml(md.ObjectName?.value),
    credit: stripHtml(md.Credit?.value).slice(0, 200),
  };
  console.log(JSON.stringify(out, null, 2));
  return out;
}

function pixelSize(file) {
  const dims = execSync(`sips -g pixelWidth -g pixelHeight "${file}"`, { encoding: 'utf8' });
  return {
    width: Number(dims.match(/pixelWidth: (\d+)/)?.[1]),
    height: Number(dims.match(/pixelHeight: (\d+)/)?.[1]),
  };
}

function findEntryFile(id) {
  const dir = join(ROOT, 'data', 'entries');
  for (const tid of readdirSync(dir)) {
    const f = join(dir, tid, `${id}.json`);
    if (existsSync(f)) return f;
  }
  throw new Error(`entry ${id} not found`);
}

async function fetchImage(fileTitle, entryId, opts = {}) {
  const { page: pdfPage, crop } = opts;
  const meta = await info(fileTitle, pdfPage);
  if (!meta) process.exit(1);

  const okLicenses = /public domain|pd|cc0|cc by(-sa)? [0-9.]+|no restrictions/i;
  if (!okLicenses.test(meta.license ?? '')) {
    console.log(`REJECT license: "${meta.license}"`);
    process.exit(1);
  }
  // A PDF's imageinfo width is the page's, not the crop's; the crop is size-checked below.
  if (!pdfPage && (meta.width ?? 0) < MIN_WIDTH) {
    console.log(`REJECT too small: ${meta.width}px wide`);
    process.exit(1);
  }

  const entryFile = findEntryFile(entryId);
  const outDir = join(ROOT, 'public', 'images', 'entries');
  mkdirSync(outDir, { recursive: true });
  const tmp = join(outDir, `${entryId}.tmp`);
  const final = join(outDir, `${entryId}.jpg`);

  const res = await fetch(meta.thumbUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.log(`REJECT download ${res.status}`);
    process.exit(1);
  }
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));

  // Sparse line-art woodcuts legitimately compress to a few KB, so the byte
  // floor only applies to small images — a big-but-tiny file is real engraving,
  // a small-and-tiny file is a logo.
  const bytes = statSync(tmp).size;
  const floor = (meta.width ?? 0) >= 900 ? 5 * 1024 : 20 * 1024;
  if (bytes < floor) {
    unlinkSync(tmp);
    console.log(`REJECT ${Math.round(bytes / 1024)}KB at ${meta.width}px — likely a logo/icon, not artwork`);
    process.exit(1);
  }

  if (crop) {
    const [px, py, pw, ph] = crop;
    const sheet = pixelSize(tmp);
    const cw = Math.round(pw * sheet.width);
    const ch = Math.round(ph * sheet.height);
    if (cw < MIN_WIDTH) {
      unlinkSync(tmp);
      console.log(`REJECT crop only ${cw}px wide (min ${MIN_WIDTH})`);
      process.exit(1);
    }
    execSync(
      `sips -c ${ch} ${cw} --cropOffset ${Math.round(py * sheet.height)} ${Math.round(px * sheet.width)} "${tmp}"`,
      { stdio: 'pipe' },
    );
  }

  // sips would happily upscale to hit the max, which only bloats a small crop.
  const cur = pixelSize(tmp);
  const resample = Math.max(cur.width, cur.height) > 1000 ? '--resampleHeightWidthMax 1000' : '';
  execSync(`sips -s format jpeg -s formatOptions 72 ${resample} "${tmp}" --out "${final}"`, { stdio: 'pipe' });
  unlinkSync(tmp);

  const { width, height } = pixelSize(final);

  const baseTitle = meta.objectName || meta.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '');

  const entry = JSON.parse(readFileSync(entryFile, 'utf8'));
  entry.image = {
    file: `/images/entries/${entryId}.jpg`,
    sourceUrl: meta.descriptionUrl,
    // A whole-book scan needs the leaf number, or the credit points at 150 pages.
    sourceTitle: pdfPage ? `${baseTitle} (p.${pdfPage})` : baseTitle,
    artist: meta.artist || undefined,
    license: meta.license,
    width,
    height,
  };
  writeFileSync(entryFile, JSON.stringify(entry, null, 2) + '\n');
  console.log(`OK ${entryId} <- ${meta.title} (${width}x${height}, ${Math.round(statSync(final).size / 1024)}KB, ${meta.license})`);
}

function flag(name) {
  const i = rest.indexOf(name);
  return i === -1 ? undefined : rest[i + 1];
}

try {
  const entryId = flag('--entry');
  const pdfPage = flag('--page');
  const cropArg = flag('--crop');
  const crop = cropArg?.split(',').map(Number);
  if (crop && (crop.length !== 4 || crop.some((n) => !(n >= 0 && n <= 1)))) {
    throw new Error('--crop wants x,y,w,h as fractions of the page, e.g. 0.55,0.5,0.35,0.38');
  }

  if (cmd === 'search') await search(arg);
  else if (cmd === 'info') await info(arg, pdfPage);
  else if (cmd === 'fetch' && entryId) await fetchImage(arg, entryId, { page: pdfPage, crop });
  else {
    console.log('usage: fetch-image.mjs search "<query>" | info "File:..." [--page N]');
    console.log('       fetch-image.mjs fetch "File:..." --entry <id> [--page N] [--crop x,y,w,h]');
    process.exit(1);
  }
} catch (e) {
  console.log(`ERROR ${e.message}`);
  process.exit(1);
}
