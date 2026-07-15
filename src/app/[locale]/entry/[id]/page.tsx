import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Emblem from "@/components/Emblem";
import EntryCard from "@/components/EntryCard";
import { getCatalogNumbers, getEntries, getEntry, getTradition, toCardData } from "@/lib/data";
import { dict, eraLabels, isLocale, typeLabels } from "@/lib/i18n";
import { LOCALES } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getEntries().map((e) => ({ locale, id: e.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const e = getEntry(id);
  if (!isLocale(locale) || !e) return {};
  return {
    title: locale === "zh" ? e.name.zh : `${e.name.en}`,
    description: e.summary[locale],
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const e = getEntry(id);
  if (!e) notFound();
  const t = getTradition(e.tradition);
  if (!t) notFound();

  const catalog = getCatalogNumbers().get(e.id) ?? "000";
  const primary = locale === "zh" ? e.name.zh : e.name.en;
  const secondary = locale === "zh" ? e.name.en : e.name.zh;
  const related = (e.related ?? [])
    .map((rid) => getEntry(rid))
    .filter((r) => r != null)
    .slice(0, 4);

  return (
    <div className="site-shell pt-8">
      <nav className="catalog-no flex flex-wrap gap-x-3 border-b border-[var(--line)] pb-3">
        <Link href={`/${locale}/dex`} className="hover:text-brass">
          {dict.entry.backToDex[locale]}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/tradition/${t.id}`} className="hover:text-brass">
          {t.name[locale]}
        </Link>
      </nav>

      <header className="grid gap-6 border-b border-[var(--line-strong)] py-9 sm:grid-cols-[7rem_1fr_auto] sm:items-end">
        <p className="font-[family-name:var(--font-display-stack)] text-6xl leading-none text-brass">{catalog}</p>
        <div>
          <p className="eyebrow">
            {t.shortName[locale]} {e.volume ? `· ${e.volume[locale]}` : ""}
          </p>
          <h1 className="mt-3 text-6xl leading-[0.95] sm:text-8xl">{primary}</h1>
          <p className="mt-3 text-vellum-dim">
            <span className="font-[family-name:var(--font-display-stack)] tracking-[0.1em]">{secondary}</span>
            {e.name.original && (
              <span className="ml-3 text-vellum-faint">
                {e.name.original}
                {e.name.originalLang ? `（${e.name.originalLang}）` : ""}
              </span>
            )}
          </p>
        </div>
        <p className="catalog-no border-l border-[var(--line)] pl-5 sm:text-right" style={{ color: t.color }}>
          {typeLabels[e.type][locale]}<br />
          {eraLabels[e.era][locale]}
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.22fr)]">
        <aside>
          <figure className="plate">
            <div className={`plate-inner ${e.image ? "" : "aspect-[4/5]"}`}>
              {e.image ? (
                <Image
                  src={e.image.file}
                  alt={primary}
                  width={e.image.width ?? 1000}
                  height={e.image.height ?? 1250}
                  preload
                  sizes="(max-width: 1024px) 100vw, 36vw"
                  className="block h-auto w-full"
                />
              ) : (
                <Emblem type={e.type} color={t.color} name={e.name.original ?? e.name.zh} />
              )}
            </div>
            <figcaption className="catalog-no mt-2 leading-relaxed">
              {e.image ? (
                <>
                  {dict.entry.imageSource[locale]}: {e.image.artist ? `${e.image.artist} · ` : ""}
                  <a href={e.image.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-brass">
                    {e.image.sourceTitle ?? "Wikimedia Commons"}
                  </a>{" "}
                  ({e.image.license})
                </>
              ) : (
                e.era === "modern" || e.era === "contemporary"
                  ? dict.entry.noImageModern[locale]
                  : dict.entry.noImageOld[locale]
              )}
            </figcaption>
          </figure>

          <dl className="paper-panel mt-8 space-y-6 p-5 text-sm">
            <div>
              <dt className="eyebrow">{dict.entry.domains[locale]}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-2">
                {e.domains[locale].map((domain) => (
                  <span key={domain} className="border border-[var(--line)] px-2.5 py-0.5 text-vellum-dim">
                    {domain}
                  </span>
                ))}
              </dd>
            </div>
            {e.traits && e.traits.length > 0 && (
              <div>
                <dt className="eyebrow">{dict.entry.traits[locale]}</dt>
                <dd className="mt-1.5">
                  <table className="w-full text-sm">
                    <tbody>
                      {e.traits.map((trait, index) => (
                        <tr key={index} className="border-b border-[var(--line)] last:border-0">
                          <td className="py-1.5 pr-3 align-top text-vellum-faint">{trait.label[locale]}</td>
                          <td className="py-1.5 text-vellum-dim">{trait.value[locale]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </dd>
              </div>
            )}
            {e.geo && (
              <div>
                <dt className="eyebrow">{dict.entry.location[locale]}</dt>
                <dd className="catalog-no mt-1.5 text-vellum-dim">
                  {e.geo.label ? `${e.geo.label[locale]} · ` : ""}
                  {Math.abs(e.geo.lat).toFixed(2)}°{e.geo.lat >= 0 ? "N" : "S"},{" "}
                  {Math.abs(e.geo.lon).toFixed(2)}°{e.geo.lon >= 0 ? "E" : "W"}
                </dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">{dict.entry.sources[locale]}</dt>
              <dd className="mt-1.5 space-y-1 text-vellum-dim">
                {e.sources.map((source, index) => (
                  <p key={index}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-brass">
                        {source[locale]}
                      </a>
                    ) : source[locale]}
                  </p>
                ))}
              </dd>
            </div>
            {e.rights && (
              <div>
                <dt className="eyebrow">{dict.entry.rights[locale]}</dt>
                <dd className="mt-1.5 text-vellum-dim">
                  <a href={e.rights.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-brass">
                    {e.rights.name}
                  </a>
                  <p className="mt-1 leading-relaxed">{e.rights.note[locale]}</p>
                </dd>
              </div>
            )}
          </dl>
        </aside>

        <article className="reading-rule">
          <p className="max-w-2xl text-2xl leading-snug text-brass" style={{ color: t.color }}>
            {e.title[locale]}
          </p>

          <div className="prose-myth mt-9 max-w-[42rem] text-lg leading-[2]">
            {e.description[locale].split(/\n\n+/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="mt-18 border-t border-[var(--line-strong)] pt-4">
          <div className="section-heading">
            <h2 className="text-3xl">{dict.entry.related[locale]}</h2>
            <span className="catalog-no">{related.length}</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-7">
            {related.map((relatedEntry) => {
              const relatedTradition = getTradition(relatedEntry.tradition)!;
              return (
                <EntryCard
                  key={relatedEntry.id}
                  entry={toCardData(relatedEntry, locale)}
                  tradition={{ shortName: relatedTradition.shortName[locale], color: relatedTradition.color }}
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
