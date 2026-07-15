import type { Category, EntryType, Era, Locale, Motif } from './types';

export const SITE_NAME = { zh: '寰宇神话志', en: 'Myth Atlas' };

export const dict = {
  tagline: {
    zh: '从残卷、神庙与口传深处醒来的寰宇神话志，记诸神、异兽、创世与仍在暗处流传的旧梦',
    en: "A living codex awakened from ruined scrolls, temples, and oral memory—of gods, monsters, origins, and old dreams still abroad in the dark",
  },
  nav: {
    atlas: { zh: '星图', en: 'Atlas' },
    dex: { zh: '万象', en: 'Codex' },
    cosmogony: { zh: '太初', en: 'Origins' },
    about: { zh: '卷后', en: 'Colophon' },
  },
  cosmogony: {
    title: { zh: '太初纪', en: 'Before the World' },
    lede: {
      zh: '天地并非只诞生过一次。在二十种古老记忆中，黑水先于日月，巨神以尸骨化作山河，真名一经呼出，万物便有了形。循着这些创世之歌，听每一个文明如何从无形中唤醒自己的世界。',
      en: 'The world was not born only once. Across twenty ancient memories, black water precedes the sun, mountains rise from the bones of giants, and a spoken true name summons all things into form.',
    },
    compare: { zh: '太初母题', en: 'Echoes of the First Age' },
    compareHint: {
      zh: '横读一行，是一方天地从混沌走向当世；纵观一列，是同一缕古老母题在诸文明间留下的异形回声。留白并非遗失，而是那部古卷从未写下这一幕。',
      en: 'Read across to follow one world from formlessness into the present age; read down to hear one ancient motif return in altered forms. A blank marks a scene that tradition never spoke.',
    },
    timeline: { zh: '太初年表', en: 'Chronicle of Origins' },
    onTradition: { zh: '启封完整创世卷', en: 'Unseal the full chronicle' },
    sources: { zh: '古卷所据', en: 'Drawn from' },
    noteLabel: { zh: '歧说与残章', en: 'Fragments and variants' },
    absent: { zh: '此卷未留下这一幕', en: 'This scene is absent from the tradition' },
  },
  home: {
    mapHint: { zh: '移转星图，俯近大地；点亮一枚星标，步入那方神域', en: 'Turn the atlas and draw close to the earth; awaken a star to enter its mythology' },
    traditions: { zh: '诸域神谱', en: 'The Mythic Realms' },
    featured: { zh: '开卷异闻', en: 'Tales at the Threshold' },
    browseAll: { zh: '启封万象全卷', en: 'Unseal the complete codex' },
    entriesCount: { zh: '则异闻', en: 'records' },
    traditionsCount: { zh: '方古域', en: 'traditions' },
  },
  dex: {
    title: { zh: '万象图鉴', en: 'The Great Codex' },
    search: { zh: '写下神名、称号、权柄或故土…', en: 'Inscribe a name, title, dominion, or homeland…' },
    all: { zh: '全部', en: 'All' },
    tradition: { zh: '神话谱系', en: 'Tradition' },
    type: { zh: '显现之形', en: 'Form' },
    era: { zh: '传诵纪元', en: 'Age' },
    results: { zh: '则异闻', en: 'records' },
    empty: { zh: '群卷寂然，未有名字回应这次叩问。散去迷雾，或换一个真名再试。', en: 'The leaves remain silent; no name answers this invocation. Clear the mist, or try another true name.' },
    clear: { zh: '散去迷雾', en: 'Dispel the mist' },
  },
  entry: {
    domains: { zh: '权柄 · 征兆', en: 'Dominions & Omens' },
    traits: { zh: '古卷侧记', en: 'Marginalia' },
    related: { zh: '命运相连者', en: 'Bound by Fate' },
    sources: { zh: '残卷所据', en: 'Witnessed in' },
    location: { zh: '故事显现之地', en: 'Where the Tale Appeared' },
    backToDex: { zh: '退回万象图鉴', en: 'Return to the codex' },
    imageSource: { zh: '图版来处', en: 'Plate provenance' },
    inTradition: { zh: '所属神系', en: 'Mythic lineage' },
    noImageModern: {
      zh: '此影尚握在今世创作者手中，故本卷只存其名，不显其形。',
      en: 'Its likeness remains in the hands of living creators; this leaf keeps the name, but does not reveal the form.',
    },
    noImageOld: {
      zh: '古卷留下了名字，却未留下可供传世的图像。',
      en: 'The old leaves preserved the name, but left no image that may yet be shown.',
    },
  },
  tradition: {
    entriesIn: { zh: '卷中留名', en: 'Names preserved' },
    onMap: { zh: '循星迹归返寰宇', en: 'Return by the star-path' },
  },
  about: {
    title: { zh: '卷后记', en: 'Colophon' },
    method: {
      zh: '本志从古典、碑铭、祭歌与口传深处拣拾诸神的旧名，也收容都市暗巷中新生的怪谈。每一则以公开文献与研究为锚，逐条留下出典；叙事可以披上夜色，来处却不隐入迷雾。对于仍被敬奉、仍在呼吸的传统，我们只在门槛外记述，不冒称神谕。群卷尚未合拢，新的名字仍会在此显现。',
      en: 'This codex gathers the old names of gods from classics, inscriptions, ritual songs, and oral memory, and receives the younger hauntings born in city streets. Every record remains anchored to published sources; the telling may wear the night, but its provenance does not vanish into mist.',
    },
    images: {
      zh: '卷中诸像取自公有领域的古画、版刻与遗物影像，多由 Wikimedia Commons 等公开馆藏借来微光。每一幅图版的前世，均记于条目页与下方清单。',
      en: 'The plates draw their light from public-domain paintings, engravings, and artifacts, chiefly through Wikimedia Commons and other open collections. Every image remembers where it came from.',
    },
    credits: { zh: '诸图来处', en: 'Provenance of the Plates' },
  },
  footer: {
    growing: { zh: '群卷仍在续写', en: 'The leaves are still being written' },
    rights: { zh: '文字取火于公开文献，图像借光于公有收藏', en: 'Words kindled from published sources; images lit by public-domain collections' },
  },
} as const;

export const typeLabels: Record<EntryType, { zh: string; en: string }> = {
  deity: { zh: '神祇', en: 'Deity' },
  creature: { zh: '异兽', en: 'Creature' },
  hero: { zh: '英雄', en: 'Hero' },
  spirit: { zh: '精怪', en: 'Spirit' },
  place: { zh: '秘境', en: 'Realm' },
  artifact: { zh: '圣物', en: 'Relic' },
  tale: { zh: '异闻', en: 'Tale' },
};

export const eraLabels: Record<Era, { zh: string; en: string }> = {
  ancient: { zh: '上古', en: 'Ancient' },
  folk: { zh: '民间', en: 'Folk' },
  modern: { zh: '今世', en: 'Modern' },
};

export const motifLabels: Record<Motif, { zh: string; en: string }> = {
  chaos: { zh: '太初无形', en: 'The Formless Deep' },
  'first-beings': { zh: '初神醒来', en: 'The First Ones Awaken' },
  separation: { zh: '天地初分', en: 'Sky Torn from Earth' },
  'world-form': { zh: '万物受形', en: 'All Things Take Form' },
  humans: { zh: '泥土有灵', en: 'Breath Given to Clay' },
  ordeal: { zh: '天倾与洪荒', en: 'Deluge and Ruin' },
  now: { zh: '此世余音', en: 'Echoes of This Age' },
};

export const categoryLabels: Record<Category, { zh: string; en: string }> = {
  pantheon: { zh: '诸神谱系', en: 'Divine lineages' },
  classic: { zh: '异兽古卷', en: 'Elder bestiaries' },
  urban: { zh: '今世怪谈', en: 'Modern hauntings' },
  lostland: { zh: '沉没之境', en: 'Drowned realms' },
};

export function isLocale(v: string): v is Locale {
  return v === 'zh' || v === 'en';
}
