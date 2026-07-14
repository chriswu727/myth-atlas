import type { Category, EntryType, Era, Locale } from './types';

export const SITE_NAME = { zh: '寰宇神话志', en: 'Myth Atlas' };

export const dict = {
  tagline: {
    zh: '收录世界各地的神话、志怪与传说',
    en: "A catalog of the world's myths, strange creatures, and legends",
  },
  nav: { atlas: { zh: '地图', en: 'Atlas' }, dex: { zh: '图鉴', en: 'Index' }, about: { zh: '关于', en: 'About' } },
  home: {
    mapHint: { zh: '拖动与缩放地图，点击星标进入该体系', en: 'Drag and zoom the map; click a star to open that tradition' },
    traditions: { zh: '收录体系', en: 'Traditions' },
    featured: { zh: '精选条目', en: 'Featured entries' },
    browseAll: { zh: '浏览全部图鉴', en: 'Browse the full index' },
    entriesCount: { zh: '条目', en: 'entries' },
    traditionsCount: { zh: '体系', en: 'traditions' },
  },
  dex: {
    title: { zh: '全图鉴', en: 'Full index' },
    search: { zh: '搜索名称、称号、领域…', en: 'Search names, titles, domains…' },
    all: { zh: '全部', en: 'All' },
    tradition: { zh: '体系', en: 'Tradition' },
    type: { zh: '类型', en: 'Type' },
    era: { zh: '时代', en: 'Era' },
    results: { zh: '个条目', en: 'entries' },
    empty: { zh: '没有匹配的条目。清除筛选或换个关键词。', en: 'No matching entries. Clear filters or try another search.' },
    clear: { zh: '清除筛选', en: 'Clear filters' },
  },
  entry: {
    domains: { zh: '司掌 · 特征', en: 'Domains' },
    traits: { zh: '速览', en: 'At a glance' },
    related: { zh: '相关条目', en: 'Related entries' },
    sources: { zh: '出典', en: 'Sources' },
    location: { zh: '传说之地', en: 'Legendary location' },
    backToDex: { zh: '返回图鉴', en: 'Back to index' },
    imageSource: { zh: '图像来源', en: 'Image source' },
    inTradition: { zh: '所属体系', en: 'Tradition' },
  },
  tradition: {
    entriesIn: { zh: '收录条目', en: 'Entries' },
    onMap: { zh: '在地图上查看', en: 'View on the map' },
  },
  about: {
    title: { zh: '关于本站', en: 'About' },
    method: {
      zh: '寰宇神话志收录世界各地的神话、志怪典籍、都市传说与失落之地。每个条目依据公开文献与研究整理撰写，逐条标注出典；对仍在信仰中的活态传统，行文以尊重与客观为先。收录持续进行，图鉴会不断扩充。',
      en: 'Myth Atlas catalogs myths, bestiaries, urban legends, and lost lands from around the world. Every entry is written from published sources and scholarship, each with its references listed; living traditions are treated with respect and care. The collection grows continuously.',
    },
    images: {
      zh: '条目配图来自公有领域的古典绘画、版画与文物影像，主要采自 Wikimedia Commons 等公开收藏，出处逐一列于条目页与下方清单。',
      en: 'Entry artwork comes from public-domain paintings, engravings, and artifact photography, chiefly via Wikimedia Commons and other open collections. Sources are credited on each entry page and listed below.',
    },
    credits: { zh: '图像出处', en: 'Image credits' },
  },
  footer: {
    growing: { zh: '持续收录中', en: 'Growing collection' },
    rights: { zh: '文本依据公开文献整理，图像来自公有领域收藏', en: 'Texts compiled from published sources; artwork from public-domain collections' },
  },
} as const;

export const typeLabels: Record<EntryType, { zh: string; en: string }> = {
  deity: { zh: '神祇', en: 'Deity' },
  creature: { zh: '异兽', en: 'Creature' },
  hero: { zh: '英雄', en: 'Hero' },
  spirit: { zh: '精怪', en: 'Spirit' },
  place: { zh: '异境', en: 'Place' },
  artifact: { zh: '神器', en: 'Artifact' },
  tale: { zh: '传说', en: 'Tale' },
};

export const eraLabels: Record<Era, { zh: string; en: string }> = {
  ancient: { zh: '上古', en: 'Ancient' },
  folk: { zh: '民间', en: 'Folk' },
  modern: { zh: '现代', en: 'Modern' },
};

export const categoryLabels: Record<Category, { zh: string; en: string }> = {
  pantheon: { zh: '神话体系', en: 'Pantheons' },
  classic: { zh: '志怪典籍', en: 'Classic bestiaries' },
  urban: { zh: '都市传说', en: 'Urban legends' },
  lostland: { zh: '失落之地', en: 'Lost lands' },
};

export function isLocale(v: string): v is Locale {
  return v === 'zh' || v === 'en';
}
