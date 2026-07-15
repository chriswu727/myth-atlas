import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EntryCard from "@/components/EntryCard";
import CosmogonyTimeline from "@/components/CosmogonyTimeline";
import { getCosmogony, getEntriesByTradition, getTradition, getTraditions, toCardData } from "@/lib/data";
import { categoryLabels, dict, isLocale } from "@/lib/i18n";
import { LOCALES, type Entry } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getTraditions().map((t) => ({ locale, id: t.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = getTradition(id);
  if (!isLocale(locale) || !t) return {};
  return { title: t.name[locale], description: t.intro?.[locale]?.slice(0, 140) };
}

export default async function TraditionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTradition(id);
  if (!t) notFound();

  const entries = getEntriesByTradition(id);
  const cosmogony = getCosmogony(id);
  const traditionIndex = getTraditions().findIndex((tradition) => tradition.id === id) + 1;

  /* group Shanhaijing by volume, everything else in one block */
  const groups: { key: string; label: string | null; list: Entry[] }[] = [];
  if (id === "shanhaijing") {
    for (const e of entries) {
      const key = e.volume?.zh ?? "";
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.list.push(e);
      else groups.push({ key, label: e.volume?.[locale] ?? null, list: [e] });
    }
  } else {
    groups.push({ key: "all", label: null, list: entries });
  }

  return (
    <div className="site-shell pt-10">
      <header className="grid gap-10 border-b border-[var(--line-strong)] pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: t.color }} />
              {categoryLabels[t.category][locale]} · {String(traditionIndex).padStart(2, "0")}
            </p>
            <h1 className="mt-5 max-w-[11ch] text-6xl leading-[0.95] sm:text-8xl">{t.name[locale]}</h1>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-5 border-t border-[var(--line)] pt-4 text-sm text-vellum-dim">
            <div>
              <dt className="catalog-no">{locale === "zh" ? "神域所辖" : "Mythic realm"}</dt>
              <dd className="mt-1">{t.region[locale]}</dd>
            </div>
            <div>
              <dt className="catalog-no">{locale === "zh" ? "传诵纪元" : "Age remembered"}</dt>
              <dd className="mt-1">{t.period[locale]}</dd>
            </div>
            <div>
              <dt className="catalog-no">{dict.tradition.entriesIn[locale]}</dt>
              <dd className="mt-1 font-[family-name:var(--font-display-stack)] text-3xl text-vellum">{entries.length}</dd>
            </div>
          </dl>
        </div>

        <div className="reading-rule">
          {t.intro && (
            <div className="prose-myth text-lg leading-[1.95] text-vellum-dim">
              {t.intro[locale].split(/\n\n+/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
          <Link href={`/${locale}`} className="button-secondary mt-3">
            {dict.tradition.onMap[locale]}
          </Link>
        </div>
      </header>

      {cosmogony && (
        <div className="mt-14">
          <CosmogonyTimeline cosmogony={cosmogony} locale={locale} />
        </div>
      )}

      {groups.map((group) => (
        <section key={group.key} className="mt-16">
          <div className="section-heading">
            <h2 className="text-3xl" style={group.label ? { color: t.color } : undefined}>
              {group.label ?? (locale === "zh" ? "卷中诸名" : "Names within the leaves")}
            </h2>
            <span className="catalog-no">{group.list.length}</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {group.list.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={toCardData(entry, locale)}
                tradition={{ shortName: t.shortName[locale], color: t.color }}
                locale={locale}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
