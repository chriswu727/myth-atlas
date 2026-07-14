import Link from "next/link";
import { notFound } from "next/navigation";
import WorldMap, { type MapPin, type MapTradition } from "@/components/WorldMap";
import EntryCard from "@/components/EntryCard";
import { getAllCardData, getEntries, getTraditions } from "@/lib/data";
import { categoryLabels, dict, isLocale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

const CATEGORY_ORDER: Category[] = ["pantheon", "classic", "urban", "lostland"];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const traditions = getTraditions();
  const entries = getEntries();
  const cards = getAllCardData(locale);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const traditionById = new Map(traditions.map((t) => [t.id, t]));

  const mapTraditions: MapTradition[] = traditions.map((t) => ({
    id: t.id,
    label: t.shortName[locale],
    color: t.color,
    anchor: t.anchor,
    countries: t.countries,
    entryCount: t.entryCount,
  }));

  const mapPins: MapPin[] = entries
    .filter((e) => e.geo)
    .map((e) => ({
      id: e.id,
      label: locale === "zh" ? e.name.zh : e.name.en,
      lat: e.geo!.lat,
      lon: e.geo!.lon,
      color: traditionById.get(e.tradition)?.color ?? "#c3a55e",
      traditionId: e.tradition,
    }));

  /* one entry per tradition: imaged entries first, otherwise a deterministic
     varied pick so the shelf isn't all № 001 */
  const byTradition = new Map<string, typeof cards>();
  for (const c of cards) {
    if (!byTradition.has(c.tradition)) byTradition.set(c.tradition, []);
    byTradition.get(c.tradition)!.push(c);
  }
  const featured = [...byTradition.entries()]
    .map(([tid, list]) => {
      const pool = list.filter((c) => c.image);
      const from = pool.length > 0 ? pool : list;
      const seed = [...tid].reduce((n, ch) => n + ch.charCodeAt(0), 0);
      return from[seed % from.length];
    })
    .slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-5">
      {/* masthead */}
      <section className="pt-12 pb-8 text-center sm:pt-16">
        <p className="eyebrow">{locale === "zh" ? "世界神话志异图鉴" : "AN ATLAS OF WORLD MYTH & LEGEND"}</p>
        <h1 className="mt-4 font-[family-name:var(--font-cjk)] text-4xl font-black tracking-[0.12em] sm:text-5xl">
          寰宇神話誌
        </h1>
        <p className="mt-2 font-[family-name:var(--font-display-stack)] text-sm tracking-[0.42em] text-brass">
          MYTH ATLAS
        </p>
        <p className="mx-auto mt-5 max-w-xl text-vellum-dim">{dict.tagline[locale]}</p>
        <p className="catalog-no mt-3">
          {entries.length} {dict.home.entriesCount[locale]} ·{" "}
          {traditions.filter((t) => t.entryCount > 0).length} {dict.home.traditionsCount[locale]}
        </p>
      </section>

      {/* the night atlas */}
      <section className="plate">
        <div className="plate-inner">
          <WorldMap traditions={mapTraditions} pins={mapPins} locale={locale} />
        </div>
      </section>
      <p className="catalog-no mt-2 text-center">{dict.home.mapHint[locale]}</p>

      {/* tradition shelf */}
      <section className="mt-16">
        {CATEGORY_ORDER.map((cat) => {
          const list = traditions.filter((t) => t.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat} className="mt-10 first:mt-0">
              <div className="flex items-baseline gap-4 border-b hairline pb-2">
                <h2 className="text-xl">{categoryLabels[cat][locale]}</h2>
                <span className="catalog-no">{list.length}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((t) => (
                  <Link
                    key={t.id}
                    href={`/${locale}/tradition/${t.id}`}
                    className="group flex items-baseline gap-2.5 py-1"
                  >
                    <svg viewBox="0 0 14 14" className="h-3 w-3 shrink-0 self-center" aria-hidden="true">
                      <path
                        d="M7,0.5 L8.7,5.3 L13.5,7 L8.7,8.7 L7,13.5 L5.3,8.7 L0.5,7 L5.3,5.3 Z"
                        fill={t.color}
                      />
                    </svg>
                    <span className="leading-snug group-hover:text-brass">{t.name[locale]}</span>
                    <span className="catalog-no ml-auto shrink-0">{t.entryCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* featured */}
      {featured.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between border-b hairline pb-2">
            <h2 className="text-xl">{dict.home.featured[locale]}</h2>
            <Link href={`/${locale}/dex`} className="text-sm text-vellum-dim hover:text-brass">
              {dict.home.browseAll[locale]} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((c) => {
              const t = traditionById.get(c.tradition)!;
              return (
                <EntryCard
                  key={c.id}
                  entry={cardById.get(c.id)!}
                  tradition={{ shortName: t.shortName[locale], color: t.color }}
                  locale={locale}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
