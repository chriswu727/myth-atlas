import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EntryCard from "@/components/EntryCard";
import EntryGallery from "@/components/EntryGallery";
import ReturnLink from "@/components/ReturnLink";
import {
  getCatalogNumbers,
  getEntries,
  getEntry,
  getTradition,
  toCardData,
} from "@/lib/data";
import { FOX_ENTRIES, FOX_HEADINGS } from "@/lib/editorial";
import { atlasUrl } from "@/lib/navigation";
import { eraLabels, isLocale, typeLabels } from "@/lib/i18n";
import { LOCALES } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getEntries().map((entry) => ({ locale, id: entry.id })),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const entry = getEntry(id);
  if (!isLocale(locale) || !entry) return {};
  return { title: entry.name[locale], description: entry.summary[locale] };
}
export default async function EntryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getEntry(id);
  if (!entry) notFound();
  const tradition = getTradition(entry.tradition);
  if (!tradition) notFound();
  const zh = locale === "zh";
  const related = (entry.related ?? [])
    .flatMap((id) => getEntry(id) ?? [])
    .slice(0, 4);
  const paragraphs = entry.description[locale].split(/\n\n+/);
  return (
    <div className="site-shell entry-reading-page">
      <nav
        className="reading-breadcrumb"
        aria-label={zh ? "阅读位置" : "Breadcrumb"}
      >
        <Suspense>
          <ReturnLink locale={locale} />
        </Suspense>
        <Link href={`/${locale}/dex`}>{zh ? "图鉴" : "Collection"}</Link>
        <span>/</span>
        <Link href={`/${locale}/tradition/${tradition.id}`}>
          {tradition.name[locale]}
        </Link>
        <span>/</span>
        <span>{entry.name[locale]}</span>
      </nav>
      <header className="entry-reading-header">
        <p className="eyebrow">
          № {getCatalogNumbers().get(entry.id)} / {tradition.shortName[locale]}
          {entry.volume ? ` · ${entry.volume[locale]}` : ""}
        </p>
        <h1>{entry.name[locale]}</h1>
        <p className="entry-secondary-name">
          {entry.name[zh ? "en" : "zh"]}
          {entry.name.original && ` · ${entry.name.original}`}
        </p>
        <p className="entry-reading-deck">{entry.title[locale]}</p>
        <div className="entry-reading-meta">
          <span>{typeLabels[entry.type][locale]}</span>
          <span>{eraLabels[entry.era][locale]}</span>
          <a href="#story">{zh ? "阅读故事" : "Read the story"}</a>
          <a href="#sources">{zh ? "文献出处" : "Sources"}</a>
        </div>
      </header>
      <div className="entry-reading-layout">
        <EntryGallery
          name={entry.name[locale]}
          archive={entry.image}
          cover={entry.coverImage}
          locale={locale}
        />
        <article id="story" className="entry-story">
          <p className="eyebrow">
            {zh ? "故事与流变" : "THE STORY & ITS AFTERLIVES"}
          </p>
          {paragraphs.map((paragraph, i) => (
            <section key={i}>
              {FOX_HEADINGS[id]?.[i] && <h2>{FOX_HEADINGS[id][i][locale]}</h2>}
              <p>{paragraph}</p>
            </section>
          ))}
          {FOX_ENTRIES.includes(id) && (
            <aside className="entry-trail-callout">
              <p className="eyebrow">
                {zh ? "沿着母题继续读" : "CONTINUE THE READING TRAIL"}
              </p>
              <h2>
                {zh ? "同样是狐，故事却不同。" : "Another fox. Another story."}
              </h2>
              <p>
                {zh
                  ? "把《山海经》的九尾狐、日本的玉藻前与朝鲜半岛的狐故事并排来看。"
                  : "Read the fox of the Shanhaijing alongside Tamamo-no-Mae and Korean fox tales."}
              </p>
              <Link href={`/${locale}/themes/foxes`}>
                {zh ? "进入东亚狐传说专题" : "Explore foxes of East Asia"}
              </Link>
            </aside>
          )}
        </article>
      </div>
      <section id="sources" className="entry-reference">
        <div>
          <p className="eyebrow">{zh ? "速览与地理" : "AT A GLANCE"}</p>
          <dl>
            {entry.traits?.map((trait, i) => (
              <div key={i}>
                <dt>{trait.label[locale]}</dt>
                <dd>{trait.value[locale]}</dd>
              </div>
            ))}
          </dl>
          <p className="entry-domains">{entry.domains[locale].join(" / ")}</p>
          {entry.geo?.label && <p>{entry.geo.label[locale]}</p>}
          <Link href={atlasUrl(locale, entry.tradition)}>
            {zh ? "在地图上探索这一体系" : "Explore this tradition on the map"}
          </Link>
        </div>
        <div>
          <p className="eyebrow">{zh ? "文献出处" : "SOURCES"}</p>
          <ol>
            {entry.sources.map((source, i) => (
              <li key={i}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source[locale]}
                  </a>
                ) : (
                  source[locale]
                )}
              </li>
            ))}
          </ol>
          {entry.rights && (
            <p className="entry-rights">
              <a href={entry.rights.url} target="_blank" rel="noreferrer">
                {entry.rights.name}
              </a>
              <br />
              {entry.rights.note[locale]}
            </p>
          )}
        </div>
      </section>
      {related.length > 0 && (
        <section className="entry-related">
          <div className="journey-section-heading">
            <div>
              <p className="eyebrow">{zh ? "继续翻阅" : "KEEP READING"}</p>
              <h2>{zh ? "相关条目" : "Related records"}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((record) => {
              const t = getTradition(record.tradition)!;
              return (
                <EntryCard
                  key={record.id}
                  entry={toCardData(record, locale)}
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
