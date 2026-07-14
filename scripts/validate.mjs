#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');

const TYPES = ['deity', 'creature', 'hero', 'spirit', 'place', 'artifact', 'tale'];
const ERAS = ['ancient', 'folk', 'modern'];
const EMOJI = /\p{Extended_Pictographic}/u;

const onlyTradition = process.argv.includes('--tradition')
  ? process.argv[process.argv.indexOf('--tradition') + 1]
  : null;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function isStr(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function bilingual(file, obj, field, { required = true } = {}) {
  const v = obj[field];
  if (v == null) {
    if (required) err(file, `missing ${field}`);
    return null;
  }
  if (!isStr(v.zh) || !isStr(v.en)) err(file, `${field} must have non-empty zh and en`);
  return v;
}
function checkEmoji(file, field, text) {
  if (typeof text === 'string' && EMOJI.test(text)) err(file, `${field} contains emoji/pictographic character`);
}

const traditions = JSON.parse(readFileSync(join(DATA, 'traditions.json'), 'utf8'));
const traditionIds = new Set(traditions.map((t) => t.id));

for (const t of traditions) {
  const f = 'traditions.json';
  if (!isStr(t.id)) err(f, 'tradition missing id');
  if (!['pantheon', 'classic', 'urban', 'lostland'].includes(t.category)) err(f, `${t.id}: bad category`);
  bilingual(f, t, 'name');
  bilingual(f, t, 'shortName');
  if (!t.anchor || typeof t.anchor.lat !== 'number' || typeof t.anchor.lon !== 'number')
    err(f, `${t.id}: anchor must have numeric lat/lon`);
  if (!/^#[0-9a-f]{6}$/i.test(t.color ?? '')) err(f, `${t.id}: color must be #rrggbb`);
  if (!Array.isArray(t.countries)) err(f, `${t.id}: countries must be an array`);
}

const allIds = new Map(); // id -> file
const allRelated = []; // {file, id}
const entriesDir = join(DATA, 'entries');
const scanTraditions = onlyTradition ? [onlyTradition] : [...traditionIds];
let entryCount = 0;

for (const tid of scanTraditions) {
  const dir = join(entriesDir, tid);
  if (!existsSync(dir)) continue;
  for (const fname of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const file = `entries/${tid}/${fname}`;
    let e;
    try {
      e = JSON.parse(readFileSync(join(dir, fname), 'utf8'));
    } catch (ex) {
      err(file, `invalid JSON: ${ex.message}`);
      continue;
    }
    entryCount++;

    if (!isStr(e.id)) err(file, 'missing id');
    else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) err(file, `id "${e.id}" must be lowercase kebab-case`);
      if (fname !== `${e.id}.json`) err(file, `filename must be ${e.id}.json`);
      if (allIds.has(e.id)) err(file, `duplicate id "${e.id}" (also in ${allIds.get(e.id)})`);
      else allIds.set(e.id, file);
    }
    if (e.tradition !== tid) err(file, `tradition "${e.tradition}" must match directory "${tid}"`);
    if (!traditionIds.has(e.tradition)) err(file, `unregistered tradition "${e.tradition}"`);
    if (!TYPES.includes(e.type)) err(file, `type must be one of ${TYPES.join('|')}`);
    if (!ERAS.includes(e.era)) err(file, `era must be one of ${ERAS.join('|')}`);

    const name = bilingual(file, e, 'name');
    if (name?.original != null) {
      if (!isStr(name.original)) err(file, 'name.original must be a non-empty string');
      if (!isStr(name.originalLang)) err(file, 'name.original requires name.originalLang');
    }
    bilingual(file, e, 'title');
    const summary = bilingual(file, e, 'summary');
    if (summary) {
      if (summary.zh.length > 80) err(file, `summary.zh too long (${summary.zh.length} > 80 chars)`);
      const words = summary.en.trim().split(/\s+/).length;
      if (words > 40) err(file, `summary.en too long (${words} > 40 words)`);
    }
    const desc = bilingual(file, e, 'description');
    if (desc) {
      if (desc.zh.length < 180) err(file, `description.zh too short (${desc.zh.length} < 180 chars)`);
      const words = desc.en.trim().split(/\s+/).length;
      if (words < 100) err(file, `description.en too short (${words} < 100 words)`);
    }

    if (!e.domains || !Array.isArray(e.domains.zh) || !Array.isArray(e.domains.en))
      err(file, 'domains must have zh/en arrays');
    else {
      if (e.domains.zh.length !== e.domains.en.length) err(file, 'domains zh/en must be same length');
      if (e.domains.zh.length < 2 || e.domains.zh.length > 5) err(file, 'domains must have 2-5 items');
    }

    if (e.traits != null) {
      if (!Array.isArray(e.traits)) err(file, 'traits must be an array');
      else
        for (const [i, tr] of e.traits.entries()) {
          if (!tr?.label?.zh || !tr?.label?.en || !tr?.value?.zh || !tr?.value?.en)
            err(file, `traits[${i}] must have bilingual label and value`);
        }
    }

    if (e.related != null) {
      if (!Array.isArray(e.related) || e.related.some((r) => !isStr(r))) err(file, 'related must be string array');
      else for (const r of e.related) allRelated.push({ file, id: r });
    }

    if (!Array.isArray(e.sources) || e.sources.length === 0) err(file, 'sources must be a non-empty array');
    else
      for (const [i, s] of e.sources.entries()) {
        if (!isStr(s?.zh) || !isStr(s?.en)) err(file, `sources[${i}] must be bilingual`);
      }

    if (e.geo != null) {
      const ok =
        typeof e.geo.lat === 'number' && typeof e.geo.lon === 'number' &&
        e.geo.lat >= -90 && e.geo.lat <= 90 && e.geo.lon >= -180 && e.geo.lon <= 180;
      if (!ok) err(file, 'geo must have lat in [-90,90], lon in [-180,180]');
      if (e.geo.label != null && (!isStr(e.geo.label.zh) || !isStr(e.geo.label.en)))
        err(file, 'geo.label must be bilingual when present');
    }

    if (e.tradition === 'shanhaijing' && e.volume == null) err(file, 'shanhaijing entries require volume');
    if (e.volume != null && (!isStr(e.volume.zh) || !isStr(e.volume.en))) err(file, 'volume must be bilingual');

    if (e.image !== null && e.image !== undefined) {
      if (!isStr(e.image?.file) || !isStr(e.image?.sourceUrl) || !isStr(e.image?.license))
        err(file, 'image must be null or {file, sourceUrl, license, ...}');
    }

    for (const [k, v] of Object.entries(flatten(e))) checkEmoji(file, k, v);
  }
}

// soft references: warn only (content arrives in batches)
if (!onlyTradition) {
  for (const { file, id } of allRelated) {
    if (!allIds.has(id)) warn(file, `related "${id}" does not exist (yet)`);
  }
}

// intros
const introTraditions = onlyTradition ? [onlyTradition] : [...traditionIds];
for (const tid of introTraditions) {
  const f = join(DATA, 'intros', `${tid}.json`);
  if (!existsSync(f)) {
    warn(`intros/${tid}.json`, 'intro not written yet');
    continue;
  }
  try {
    const intro = JSON.parse(readFileSync(f, 'utf8'));
    if (!isStr(intro.zh) || !isStr(intro.en)) err(`intros/${tid}.json`, 'intro must have non-empty zh and en');
    if (intro.zh?.length < 100) err(`intros/${tid}.json`, `intro.zh too short (${intro.zh.length} < 100 chars)`);
  } catch (ex) {
    err(`intros/${tid}.json`, `invalid JSON: ${ex.message}`);
  }
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (Array.isArray(v)) v.forEach((item, i) => Object.assign(out, typeof item === 'string' ? { [`${key}[${i}]`]: item } : flatten(item, `${key}[${i}]`)));
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
  }
  return out;
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${entryCount} entries checked — ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length > 0 ? 1 : 0);
