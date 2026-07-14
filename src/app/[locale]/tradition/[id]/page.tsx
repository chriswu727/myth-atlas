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
    <div className="mx-auto w-full max-w-6xl px-5 pt-10">
      <header className="max-w-3xl">
        <p className="eyebrow flex items-center gap-2.5">
          <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden="true">
            <path d="M7,0.5 L8.7,5.3 L13.5,7 L8.7,8.7 L7,13.5 L5.3,8.7 L0.5,7 L5.3,5.3 Z" fill={t.color} />
          </svg>
          {categoryLabels[t.category][locale]}
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{t.name[locale]}</h1>
        <p className="catalog-no mt-3">
          {t.region[locale]} · {t.period[locale]} · {entries.length}{" "}
          {dict.tradition.entriesIn[locale]}
        </p>
        {t.intro && (
          <div className="prose-myth mt-7 leading-[1.9] text-vellum-dim">
            {t.intro[locale].split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
        <p className="mt-4">
          <Link href={`/${locale}`} className="catalog-no underline underline-offset-4 hover:text-brass">
            {dict.tradition.onMap[locale]}
          </Link>
        </p>
      </header>

      {cosmogony && (
        <div className="mt-14 max-w-3xl">
          <CosmogonyTimeline cosmogony={cosmogony} color={t.color} locale={locale} />
        </div>
      )}

      {groups.map((g) => (
        <section key={g.key} className="mt-12">
          {g.label && (
            <h2 className="border-b hairline pb-2 text-xl" style={{ color: t.color }}>
              {g.label}
            </h2>
          )}
          <div className={`grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 ${g.label ? "mt-6" : ""}`}>
            {g.list.map((e) => (
              <EntryCard
                key={e.id}
                entry={toCardData(e, locale)}
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
