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
    <div className="mx-auto w-full max-w-6xl px-5 pt-8">
      <nav className="catalog-no flex flex-wrap gap-x-3">
        <Link href={`/${locale}/dex`} className="hover:text-brass">
          {dict.entry.backToDex[locale]}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/tradition/${t.id}`} className="hover:text-brass">
          {t.name[locale]}
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[400px_1fr]">
        {/* plate column */}
        <div>
          <div className="plate">
            <div className={`plate-inner ${e.image ? "" : "aspect-[4/5]"}`}>
              {e.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image.file} alt={primary} className="block h-auto w-full" />
              ) : (
                <Emblem
                  type={e.type}
                  color={t.color}
                  name={e.name.original ?? e.name.zh}
                />
              )}
            </div>
          </div>
          {!e.image && (
            <p className="catalog-no mt-2 leading-relaxed">
              {e.era === "modern" ? dict.entry.noImageModern[locale] : dict.entry.noImageOld[locale]}
            </p>
          )}
          {e.image && (
            <p className="catalog-no mt-2 leading-relaxed">
              {dict.entry.imageSource[locale]}:{" "}
              {e.image.artist ? `${e.image.artist} · ` : ""}
              <a
                href={e.image.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-brass"
              >
                {e.image.sourceTitle ?? "Wikimedia Commons"}
              </a>{" "}
              ({e.image.license})
            </p>
          )}

          {/* specimen facts */}
          <dl className="mt-6 space-y-4 border-t hairline pt-5 text-sm">
            <div>
              <dt className="eyebrow">{dict.entry.domains[locale]}</dt>
              <dd className="mt-1.5 flex flex-wrap gap-2">
                {e.domains[locale].map((d) => (
                  <span key={d} className="border border-[var(--brass-faint)] px-2.5 py-0.5 text-vellum-dim">
                    {d}
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
                      {e.traits.map((tr, i) => (
                        <tr key={i} className="border-b border-[var(--brass-faint)] last:border-0">
                          <td className="py-1.5 pr-3 align-top text-vellum-faint">{tr.label[locale]}</td>
                          <td className="py-1.5 text-vellum-dim">{tr.value[locale]}</td>
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
                {e.sources.map((s, i) => (
                  <p key={i}>{s[locale]}</p>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {/* reading column */}
        <article>
          <p className="catalog-no">
            № {catalog} · {t.shortName[locale]}
            {e.volume ? ` · ${e.volume[locale]}` : ""} ·{" "}
            <span style={{ color: t.color }}>
              {typeLabels[e.type][locale]} · {eraLabels[e.era][locale]}
            </span>
          </p>
          <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{primary}</h1>
          <p className="mt-2 text-vellum-dim">
            <span className="font-[family-name:var(--font-display-stack)] tracking-[0.12em]">{secondary}</span>
            {e.name.original && (
              <span className="ml-3 text-vellum-faint">
                {e.name.original}
                {e.name.originalLang ? `（${e.name.originalLang}）` : ""}
              </span>
            )}
          </p>
          <p className="mt-4 border-l-2 pl-4 text-lg text-brass" style={{ borderColor: t.color }}>
            {e.title[locale]}
          </p>

          <div className="prose-myth mt-8 max-w-prose text-[1.0625rem] leading-[1.9]">
            {e.description[locale].split(/\n\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="eyebrow border-b hairline pb-2">{dict.entry.related[locale]}</h2>
              <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((r) => {
                  const rt = getTradition(r.tradition)!;
                  return (
                    <EntryCard
                      key={r.id}
                      entry={toCardData(r, locale)}
                      tradition={{ shortName: rt.shortName[locale], color: rt.color }}
                      locale={locale}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
