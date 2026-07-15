import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DexBrowser, { type DexTradition } from "@/components/DexBrowser";
import { getAllCardData, getTraditions } from "@/lib/data";
import { dict, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: dict.dex.title[locale] };
}

export default async function DexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const entries = getAllCardData(locale);
  const traditions: DexTradition[] = getTraditions()
    .filter((t) => t.entryCount > 0)
    .map((t) => ({
      id: t.id,
      name: t.name[locale],
      shortName: t.shortName[locale],
      color: t.color,
      count: t.entryCount,
    }));

  return (
    <div className="site-shell pt-12">
      <header className="grid gap-6 border-b border-[var(--line-strong)] pb-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="eyebrow">
            {entries.length} {locale === "zh" ? "则神名与异闻，仍待后人续录" : "OLD NAMES & STRANGE TALES · THE CODEX REMAINS OPEN"}
          </p>
          <h1 className="mt-3 text-6xl leading-none sm:text-8xl">{dict.dex.title[locale]}</h1>
        </div>
        <p className="max-w-sm text-vellum-dim sm:text-right">
          {locale === "zh"
            ? "循神话谱系、传诵纪元与显现之形翻阅群卷；若已知其真名，亦可直接将它唤来。"
            : "Read by mythic lineage, remembered age, or manifested form—or inscribe a true name and call it forth."}
        </p>
      </header>
      <div className="pt-10">
      <Suspense fallback={null}>
        <DexBrowser entries={entries} traditions={traditions} locale={locale} />
      </Suspense>
      </div>
    </div>
  );
}
