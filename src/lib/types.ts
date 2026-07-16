export type Locale = 'zh' | 'en';
export const LOCALES: Locale[] = ['zh', 'en'];

export interface L<T = string> {
  zh: T;
  en: T;
}

export type Category = 'pantheon' | 'classic' | 'modern-myth' | 'urban' | 'lostland';
export type EntryType = 'deity' | 'creature' | 'hero' | 'spirit' | 'place' | 'artifact' | 'tale';
export type Era = 'ancient' | 'folk' | 'modern' | 'contemporary';

export const ENTRY_TYPES: EntryType[] = ['deity', 'creature', 'hero', 'spirit', 'place', 'artifact', 'tale'];
export const ERAS: Era[] = ['ancient', 'folk', 'modern', 'contemporary'];

export interface Tradition {
  id: string;
  category: Category;
  name: L;
  shortName: L;
  region: L;
  period: L;
  anchor: { lat: number; lon: number };
  countries: number[];
  color: string;
}

export interface TraditionFull extends Tradition {
  intro: L | null;
  entryCount: number;
}

export type Motif = 'chaos' | 'first-beings' | 'separation' | 'world-form' | 'humans' | 'ordeal' | 'now';

/** Order matters: it is the spine of the cross-cultural comparison. */
export const MOTIFS: Motif[] = [
  'chaos',
  'first-beings',
  'separation',
  'world-form',
  'humans',
  'ordeal',
  'now',
];

export interface CosmogonyStage {
  motif: Motif;
  phase: L;
  title: L;
  text: L;
  entries?: string[];
}

export interface Cosmogony {
  tradition: string;
  source: L;
  note?: L | null;
  stages: CosmogonyStage[];
}

export interface EntryImage {
  file: string;
  sourceUrl: string;
  license: string;
  artist?: string;
  sourceTitle?: string;
  width?: number;
  height?: number;
}

export interface EntryCoverImage {
  file: string;
  sourceTitle: string;
  artist: string;
  license: string;
  width?: number;
  height?: number;
}

export interface EntrySource extends L {
  url?: string;
}

export interface EntryRights {
  name: string;
  url: string;
  note: L;
}

export interface Entry {
  id: string;
  tradition: string;
  type: EntryType;
  era: Era;
  name: { zh: string; en: string; original?: string; originalLang?: string };
  title: L;
  summary: L;
  description: L;
  domains: L<string[]>;
  traits?: { label: L; value: L }[];
  related?: string[];
  sources: EntrySource[];
  rights?: EntryRights;
  geo?: { lat: number; lon: number; label?: L };
  volume?: L;
  image?: EntryImage | null;
  coverImage?: EntryCoverImage | null;
}

/** Lightweight shape passed to client components (dex grid, map pins). */
export interface EntryCardData {
  id: string;
  tradition: string;
  type: EntryType;
  era: Era;
  nameZh: string;
  nameEn: string;
  original?: string;
  title: string;
  summary: string;
  domains: string[];
  volume?: string;
  catalog: string;
  image?: {
    file: string;
    width?: number;
    height?: number;
    kind: 'reconstruction' | 'archive';
  } | null;
  geo?: { lat: number; lon: number } | null;
}
