#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const entriesRoot = join(root, 'data', 'entries');
const imagesRoot = join(root, 'public', 'images', 'entries');
const suspiciousPatterns = [
  { label: '不是…而是', pattern: /不是[^。！？]{0,80}而是/ },
  { label: '并非…而是', pattern: /并非[^。！？]{0,80}而是/ },
  { label: '值得注意的是', pattern: /值得注意的是/ },
  { label: '承载着人类', pattern: /承载着人类/ },
  { label: '神秘而迷人', pattern: /神秘而迷人/ },
];

const files = readdirSync(entriesRoot).flatMap((tradition) =>
  readdirSync(join(entriesRoot, tradition))
    .filter((file) => file.endsWith('.json'))
    .map((file) => join(entriesRoot, tradition, file)),
);
const entries = files.map((file) => ({ file, data: JSON.parse(readFileSync(file, 'utf8')) }));
const ids = new Set(entries.map(({ data }) => data.id));
const imageNames = new Set(
  entries.flatMap(({ data }) => (data.image?.file ? [basename(data.image.file)] : [])),
);
const localImages = readdirSync(imagesRoot).filter((file) => /\.(jpe?g|png|webp|svg)$/i.test(file));

const missingImages = entries
  .filter(({ data }) => !data.image?.file)
  .map(({ data }) => `${data.tradition}/${data.id}`);
const missingFiles = entries
  .filter(({ data }) => data.image?.file && !existsSync(join(root, 'public', data.image.file)))
  .map(({ data }) => `${data.id}: ${data.image.file}`);
const orphanImages = localImages.filter((file) => !imageNames.has(file));
const dangling = entries.flatMap(({ data }) =>
  (data.related ?? []).filter((id) => !ids.has(id)).map((id) => `${data.id} -> ${id}`),
);
const suspicious = entries.flatMap(({ data }) => {
  const text = JSON.stringify(data);
  return suspiciousPatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => `${data.tradition}/${data.id}: ${label}`);
});
const singleSource = entries
  .filter(({ data }) => data.sources?.length === 1)
  .map(({ data }) => `${data.tradition}/${data.id}`);

const hashes = new Map();
for (const file of localImages) {
  const hash = createHash('sha256').update(readFileSync(join(imagesRoot, file))).digest('hex');
  hashes.set(hash, [...(hashes.get(hash) ?? []), file]);
}
const duplicateImages = [...hashes.values()].filter((group) => group.length > 1);

console.log(`Content audit — ${entries.length} entries`);
console.log(`${imageNames.size} attributed images · ${missingImages.length} entries without images`);
console.log(`${singleSource.length} entries with one source · ${dangling.length} dangling references`);
console.log(`${missingFiles.length} missing image files · ${orphanImages.length} orphan images · ${duplicateImages.length} duplicate image groups`);
console.log(`${suspicious.length} flagged editorial phrases`);

printList('Entries without images', missingImages);
printList('Entries with one source', singleSource);
printList('Dangling references', dangling);
printList('Missing image files', missingFiles);
printList('Orphan images', orphanImages);
printList('Duplicate image groups', duplicateImages.map((group) => group.join(', ')));
printList('Flagged editorial phrases', suspicious);

if (missingFiles.length > 0) process.exitCode = 1;

function printList(title, items) {
  if (items.length === 0) return;
  console.log(`\n${title} (${items.length})`);
  for (const item of items) console.log(`- ${item}`);
}
