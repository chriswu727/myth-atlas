import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorldMap, { type MapPin, type MapTradition } from "@/components/WorldMap";
import EntryCard from "@/components/EntryCard";
import { getAllCardData, getEntries, getEntry, getTraditions } from "@/lib/data";
import { categoryLabels, dict, isLocale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

const CATEGORY_ORDER: Category[] = ["pantheon", "classic", "urban", "lostland"];
const CURATED_IDS = ["raven", "yggdrasil", "amaterasu", "quetzalcoatl"];
const HERO_ORBIT_IDS = ["raven", "anubis"];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const traditions = getTraditions();
  const entries = getEntries();
  const cards = getAllCardData(locale);
  const cardById = new Map(cards.map((card) => [card.id, card]));
  const traditionById = new Map(traditions.map((tradition) => [tradition.id, tradition]));
  const heroEntry = getEntry("nuwa");
  const heroOrbitEntries = HERO_ORBIT_IDS.flatMap((id) => {
    const entry = getEntry(id);
    return entry?.image ? [entry] : [];
  });
  const curated = CURATED_IDS.flatMap((id) => {
    const card = cardById.get(id);
    return card ? [card] : [];
  });

  const mapTraditions: MapTradition[] = traditions.map((tradition) => ({
    id: tradition.id,
    label: tradition.shortName[locale],
    color: tradition.color,
    anchor: tradition.anchor,
    countries: tradition.countries,
    entryCount: tradition.entryCount,
  }));

  const mapPins: MapPin[] = entries
    .filter((entry) => entry.geo)
    .map((entry) => ({
      id: entry.id,
      label: locale === "zh" ? entry.name.zh : entry.name.en,
      lat: entry.geo!.lat,
      lon: entry.geo!.lon,
      color: traditionById.get(entry.tradition)?.color ?? "#9f3428",
      traditionId: entry.tradition,
    }));

  return (
    <div className="site-shell">
      <section className="home-hero">
        <div className="flex flex-col justify-between py-12 pr-0 lg:py-18 lg:pr-14">
          <div className="min-w-0">
            <p className="eyebrow">{locale === "zh" ? "诸神纪年 · 异兽图谱 · 失落世界" : "CHRONICLES OF GODS · BEASTS · LOST WORLDS"}</p>
            <h1 className="home-title mt-6">寰宇神話誌</h1>
            <p className="mt-5 font-[family-name:var(--font-display-stack)] text-sm tracking-[0.36em] text-brass">
              MYTH ATLAS
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="max-w-2xl text-2xl leading-snug sm:text-3xl">
                {locale === "zh"
                  ? "天地曾不止一次诞生。循残卷与星迹，重返诸神尚未沉默的年代。"
                  : "The world was born more than once. Follow ruined leaves and star-paths into the age before the gods fell silent."}
              </p>
              <p className="mt-4 max-w-xl text-vellum-dim">{dict.tagline[locale]}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/${locale}/dex`} className="button-primary">
                  {locale === "zh" ? "启封万象图鉴" : "Unseal the great codex"}
                </Link>
                <Link href={`/${locale}/cosmogony`} className="button-secondary">
                  {locale === "zh" ? "步入创世长夜" : "Enter the first night"}
                </Link>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-7 border-l border-[var(--line)] pl-6 sm:grid-cols-1 sm:gap-y-4">
              <div>
                <dd className="font-[family-name:var(--font-display-stack)] text-4xl leading-none">{entries.length}</dd>
                <dt className="catalog-no mt-1">{dict.home.entriesCount[locale]}</dt>
              </div>
              <div>
                <dd className="font-[family-name:var(--font-display-stack)] text-4xl leading-none">{traditions.length}</dd>
                <dt className="catalog-no mt-1">{dict.home.traditionsCount[locale]}</dt>
              </div>
            </dl>
          </div>
        </div>

        {heroEntry?.image && (
          <div className="hero-collage">
            <div className="hero-registration" aria-hidden="true">
              <span>MA–001</span>
              <span>35.8617° N</span>
            </div>
            <Link href={`/${locale}/entry/${heroEntry.id}`} className="hero-plate hero-main-plate group block">
              <Image
                src={heroEntry.image.file}
                alt={heroEntry.name[locale]}
                fill
                preload
                sizes="(max-width: 900px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute right-0 bottom-0 left-0 z-2 p-6 text-[var(--paper-pale)] sm:p-8">
                <p className="font-[family-name:var(--font-mono-stack)] text-[0.62rem] tracking-[0.16em] text-[#d8c9aa]">
                  {locale === "zh" ? "开卷条目 · 华夏神话" : "OPENING PLATE · CHINESE MYTHOLOGY"}
                </p>
                <p className="mt-2 font-[family-name:var(--font-cjk)] text-3xl font-black">{heroEntry.name[locale]}</p>
                <p className="mt-1 max-w-sm text-sm text-[#e4d9c1]">{heroEntry.title[locale]}</p>
              </div>
            </Link>

            {heroOrbitEntries.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/${locale}/entry/${entry.id}`}
                className={`hero-orbit hero-orbit-${index + 1} group`}
              >
                <span className="hero-orbit-image">
                  <Image
                    src={entry.image!.file}
                    alt={entry.name[locale]}
                    fill
                    sizes="10rem"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="hero-orbit-caption">
                  <span>PLATE 0{index + 2}</span>
                  <strong>{entry.name[locale]}</strong>
                </span>
              </Link>
            ))}

            <p className="hero-margin-note" aria-hidden="true">
              {locale === "zh" ? "神祇／异兽／幽冥／太初" : "DEITIES / BEASTS / UNDERWORLDS / ORIGINS"}
            </p>
          </div>
        )}
      </section>

      <nav className="myth-ribbon" aria-label={locale === "zh" ? "神话传统速览" : "Myth traditions quick index"}>
        <div className="myth-ribbon-track">
          <div className="myth-ribbon-set">
            {traditions.map((tradition, index) => (
              <Link key={tradition.id} href={`/${locale}/tradition/${tradition.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {tradition.shortName[locale]}
              </Link>
            ))}
          </div>
          <div className="myth-ribbon-set" aria-hidden="true">
            {traditions.map((tradition, index) => (
              <span key={tradition.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {tradition.shortName[locale]}
              </span>
            ))}
          </div>
        </div>
      </nav>

      <section className="atlas-section editorial-reveal py-18 sm:py-24">
        <div className="atlas-intro">
          <div>
            <p className="eyebrow">01 · ATLAS</p>
            <h2 className="atlas-title mt-3">
              {locale === "zh" ? "循光痕，渡向诸神故土" : "Follow the traces of light to the homelands of gods"}
            </h2>
          </div>
          <div className="atlas-deck">
            <p className="mt-5 text-vellum-dim">
              {locale === "zh"
                ? "每一片幽明色域，都覆着一方古老神土。俯近大地，神迹、异兽与夜行怪谈便从沉睡的坐标中浮现。"
                : "Each field of half-light veils an elder mythology. Draw close to the earth and the sites of miracles, monsters, and night-born tales rise from sleeping coordinates."}
            </p>
            <p className="catalog-no mt-6">{dict.home.mapHint[locale]}</p>
          </div>
        </div>
        <div className="atlas-stage atlas-stage-expanded min-w-0">
          <div className="map-frame p-1.5">
            <div className="plate-inner">
              <WorldMap traditions={mapTraditions} pins={mapPins} locale={locale} />
            </div>
          </div>
          <div className="atlas-coordinate atlas-coordinate-top" aria-hidden="true">
            <span>180°W</span><span>0°</span><span>180°E</span>
          </div>
          <div className="atlas-coordinate atlas-coordinate-side" aria-hidden="true">
            <span>60°N</span><span>EQ</span><span>60°S</span>
          </div>
          <div className="atlas-stat atlas-stat-left">
            <strong>{traditions.length}</strong>
            <span>{locale === "zh" ? "古老谱系" : "MYTHIC LINEAGES"}</span>
          </div>
          <div className="atlas-stat atlas-stat-right">
            <strong>{mapPins.length}</strong>
            <span>{locale === "zh" ? "传说遗迹" : "LEGENDARY SITES"}</span>
          </div>
        </div>
      </section>

      <section className="editorial-reveal border-t border-[var(--line-strong)] py-18 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <div className="min-w-0">
            <p className="eyebrow">02 · ARCHIVE</p>
            <h2 className="mt-3 text-4xl leading-none sm:text-5xl">{dict.home.traditions[locale]}</h2>
            <form action={`/${locale}/dex`} className="mt-8 border-b border-[var(--line-strong)]">
              <label htmlFor="home-search" className="catalog-no block">
                {locale === "zh" ? "以真名、故土或古老母题叩问" : "Invoke by true name, homeland, or ancient motif"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="home-search"
                  type="search"
                  name="q"
                  placeholder={dict.dex.search[locale]}
                  className="min-w-0 flex-1 bg-transparent py-3 text-base placeholder:text-vellum-faint focus:outline-none"
                />
                <button type="submit" className="eyebrow py-3 hover:text-vellum">
                  {locale === "zh" ? "叩问" : "Invoke"}
                </button>
              </div>
            </form>
          </div>

          <div className="grid min-w-0 gap-x-8 gap-y-10 sm:grid-cols-2">
            {CATEGORY_ORDER.map((category, categoryIndex) => {
              const list = traditions.filter((tradition) => tradition.category === category);
              return (
                <section key={category} className="content-auto">
                  <div className="flex items-end justify-between border-b border-[var(--line-strong)] pb-2">
                    <div>
                      <span className="catalog-no">0{categoryIndex + 1}</span>
                      <h3 className="mt-1 text-2xl">{categoryLabels[category][locale]}</h3>
                    </div>
                    <span className="font-[family-name:var(--font-display-stack)] text-4xl text-brass">{list.length}</span>
                  </div>
                  <div className="mt-2">
                    {list.map((tradition) => (
                      <Link
                        key={tradition.id}
                        href={`/${locale}/tradition/${tradition.id}`}
                        className="group grid grid-cols-[0.65rem_1fr_auto] items-center gap-3 border-b border-[var(--line)] py-2.5"
                      >
                        <span className="h-2 w-2" style={{ backgroundColor: tradition.color }} />
                        <span className="group-hover:text-brass">{tradition.name[locale]}</span>
                        <span className="catalog-no">{tradition.entryCount}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="editorial-reveal pb-16 pt-4">
        <div className="section-heading">
          <h2 className="text-3xl">{locale === "zh" ? "夜读四异" : "Four tales for the night"}</h2>
          <Link href={`/${locale}/dex`} className="catalog-no hover:text-brass">
            {dict.home.browseAll[locale]}
          </Link>
        </div>
        <div className="curated-grid mt-8">
          {curated.map((card, index) => {
            const tradition = traditionById.get(card.tradition)!;
            return (
              <div key={card.id} className={`curated-item curated-item-${index + 1}`}>
                <EntryCard
                  entry={card}
                  tradition={{ shortName: tradition.shortName[locale], color: tradition.color }}
                  locale={locale}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
