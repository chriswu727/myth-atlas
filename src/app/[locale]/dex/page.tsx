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
    <div className="mx-auto w-full max-w-6xl px-5 pt-10">
      <div className="flex items-baseline gap-4 pb-6">
        <h1 className="text-3xl">{dict.dex.title[locale]}</h1>
        <span className="catalog-no">
          {entries.length} {dict.dex.results[locale]}
        </span>
      </div>
      <Suspense fallback={null}>
        <DexBrowser entries={entries} traditions={traditions} locale={locale} />
      </Suspense>
    </div>
  );
}
