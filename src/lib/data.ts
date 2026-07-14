import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import type { Entry, EntryCardData, L, Locale, Tradition, TraditionFull } from './types';

const DATA = join(process.cwd(), 'data');

const VOLUME_ORDER = [
  '南山经', '西山经', '北山经', '东山经', '中山经',
  '海外南经', '海外西经', '海外北经', '海外东经',
  '海内南经', '海内西经', '海内北经', '海内东经',
  '大荒东经', '大荒南经', '大荒西经', '大荒北经', '海内经',
];

export const getTraditions = cache((): TraditionFull[] => {
  const raw: Tradition[] = JSON.parse(readFileSync(join(DATA, 'traditions.json'), 'utf8'));
  const entries = getEntries();
  return raw.map((t) => {
    const introFile = join(DATA, 'intros', `${t.id}.json`);
    const intro: L | null = existsSync(introFile) ? JSON.parse(readFileSync(introFile, 'utf8')) : null;
    return { ...t, intro, entryCount: entries.filter((e) => e.tradition === t.id).length };
  });
});

export const getTradition = (id: string): TraditionFull | undefined =>
  getTraditions().find((t) => t.id === id);

export const getEntries = cache((): Entry[] => {
  const dir = join(DATA, 'entries');
  if (!existsSync(dir)) return [];
  const all: Entry[] = [];
  for (const tid of readdirSync(dir)) {
    const tdir = join(dir, tid);
    let files: string[];
    try {
      files = readdirSync(tdir).filter((f) => f.endsWith('.json'));
    } catch {
      continue;
    }
    for (const f of files) {
      try {
        all.push(JSON.parse(readFileSync(join(tdir, f), 'utf8')));
      } catch {
        // invalid file: validator's job, don't crash the build
      }
    }
  }
  all.sort((a, b) => (a.tradition === b.tradition ? a.id.localeCompare(b.id) : a.tradition.localeCompare(b.tradition)));
  return all;
});

export const getEntry = (id: string): Entry | undefined => getEntries().find((e) => e.id === id);

export const getEntriesByTradition = (tid: string): Entry[] => {
  const list = getEntries().filter((e) => e.tradition === tid);
  if (tid === 'shanhaijing') {
    list.sort((a, b) => {
      const va = VOLUME_ORDER.indexOf(a.volume?.zh ?? '');
      const vb = VOLUME_ORDER.indexOf(b.volume?.zh ?? '');
      return va === vb ? a.id.localeCompare(b.id) : va - vb;
    });
  }
  return list;
};

/** Museum-style accession number: position within its tradition (build-time, cosmetic). */
export const getCatalogNumbers = cache((): Map<string, string> => {
  const map = new Map<string, string>();
  const byTradition = new Map<string, Entry[]>();
  for (const e of getEntries()) {
    if (!byTradition.has(e.tradition)) byTradition.set(e.tradition, []);
    byTradition.get(e.tradition)!.push(e);
  }
  for (const list of byTradition.values()) {
    list.forEach((e, i) => map.set(e.id, String(i + 1).padStart(3, '0')));
  }
  return map;
});

export function toCardData(e: Entry, locale: Locale): EntryCardData {
  return {
    id: e.id,
    tradition: e.tradition,
    type: e.type,
    era: e.era,
    nameZh: e.name.zh,
    nameEn: e.name.en,
    original: e.name.original,
    title: e.title[locale],
    summary: e.summary[locale],
    domains: e.domains[locale],
    volume: e.volume?.[locale],
    catalog: getCatalogNumbers().get(e.id) ?? '000',
    image: e.image ? { file: e.image.file, width: e.image.width, height: e.image.height } : null,
    geo: e.geo ? { lat: e.geo.lat, lon: e.geo.lon } : null,
  };
}

export const getAllCardData = cache((locale: Locale): EntryCardData[] =>
  getEntries().map((e) => toCardData(e, locale))
);
