import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorldMap, {
  type MapPin,
  type MapTradition,
  type MapPreview,
} from "@/components/WorldMap";
import EntryCard from "@/components/EntryCard";
import {
  getAllCardData,
  getCosmogonies,
  getDisplayImage,
  getEntries,
  getEntry,
  getTraditions,
} from "@/lib/data";
import { categoryLabels, isLocale } from "@/lib/i18n";
import type { Category, Entry } from "@/lib/types";

const PICKS: Record<string, string[]> = {
  shanhaijing: ["jiu-wei-hu", "jing-wei", "dijiang"],
  greek: ["zeus", "prometheus", "persephone"],
  norse: ["yggdrasil", "odin", "fenrir"],
  japanese: ["tamamo-no-mae", "amaterasu", "susanoo"],
  korean: ["kumiho", "dangun", "dokkaebi"],
};
const CATEGORIES: Category[] = [
  "pantheon",
  "classic",
  "modern-myth",
  "urban",
  "lostland",
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  const traditions = getTraditions();
  const entries = getEntries();
  const cosmogonies = getCosmogonies();
  const stories = new Set(cosmogonies.map((story) => story.tradition));
  const preview = (entry: Entry): MapPreview => ({
    id: entry.id,
    label: entry.name[locale],
    summary: entry.summary[locale],
    image: getDisplayImage(entry)?.file ?? null,
  });
  const mapTraditions: MapTradition[] = traditions.map((tradition) => {
    const list = entries.filter((entry) => entry.tradition === tradition.id);
    const preferred = (PICKS[tradition.id] ?? []).flatMap(
      (id) => list.find((entry) => entry.id === id) ?? [],
    );
    const featured = [
      ...preferred,
      ...list.filter((entry) => !preferred.includes(entry)),
    ].slice(0, 3);
    return {
      id: tradition.id,
      category: tradition.category,
      intro: (tradition.intro?.[locale] ?? "").split(/\n\s*\n/)[0],
      comparisonOptions: (() => {
        const story = cosmogonies.find(
          (story) => story.tradition === tradition.id,
        );
        if (!story) return [];
        return story.branches?.length
          ? story.branches.map((branch) => ({
              id: `${tradition.id}:${branch.id}`,
              label: `${tradition.shortName[locale]} · ${branch.label[locale]}`,
            }))
          : [{ id: tradition.id, label: tradition.name[locale] }];
      })(),
      label: tradition.shortName[locale],
      region: tradition.region[locale],
      color: tradition.color,
      anchor: tradition.anchor,
      countries: tradition.countries,
      entryCount: tradition.entryCount,
      featured: featured.map(preview),
      hasCosmogony: stories.has(tradition.id),
    };
  });
  const mapPins: MapPin[] = entries
    .filter((entry) => entry.geo)
    .map((entry) => ({
      ...preview(entry),
      lat: entry.geo!.lat,
      lon: entry.geo!.lon,
      color: traditions.find((t) => t.id === entry.tradition)!.color,
      traditionId: entry.tradition,
    }));
  const fox = getEntry("jiu-wei-hu")!;
  const heroImage = getDisplayImage(fox)!;
  const cards = getAllCardData(locale);
  const curated = ["raven", "yggdrasil", "amaterasu", "quetzalcoatl"].flatMap(
    (id) => cards.find((card) => card.id === id) ?? [],
  );

  return (
    <div className="site-shell journey-home">
      <section className="journey-hero">
        <div className="journey-hero-copy">
          <p className="eyebrow">
            MYTH ATLAS ·{" "}
            {zh
              ? "一部可以探索的世界神话图鉴"
              : "A FIELD GUIDE TO THE MYTHIC WORLD"}
          </p>
          <h1>寰宇神話誌</h1>
          <p className="journey-hero-line">
            {zh ? "山海之间，\n诸神仍有回声。" : "Old worlds.\nLiving stories."}
          </p>
          <p>
            {zh
              ? "把不同地方的神话放在一起，沿着创世、灾难与新生，发现故事之间的呼应。"
              : "Read myths from different places together. Follow creation, catastrophe and renewal to discover echoes between stories."}
          </p>
          <div className="journey-actions">
            <a className="button-primary" href="#atlas">
              {zh ? "开始探索地图" : "Explore the atlas"}
            </a>
            <Link
              className="button-secondary"
              href={`/${locale}/cosmogony#compare`}
            >
              {zh ? "时间线对比" : "Compare narratives"}
            </Link>
          </div>
          <p className="journey-inventory">
            {entries.length} {zh ? "个双语条目" : "bilingual records"}
            <span />
            {traditions.length}{" "}
            {zh ? "个传统与专题" : "traditions & collections"}
            <span />
            {stories.size} {zh ? "组创世叙事" : "origin collections"}
          </p>
        </div>
        <Link className="journey-hero-plate" href={`/${locale}/themes/foxes`}>
          <Image
            src={heroImage.file}
            alt={
              zh
                ? "九尾狐的当代演绎"
                : "Contemporary interpretation of the nine-tailed fox"
            }
            fill
            preload
            sizes="(max-width: 760px) 100vw, 45vw"
          />
          <span className="journey-plate-caption">
            <span className="eyebrow">
              01 / {zh ? "专题阅读" : "READING TRAIL"}
            </span>
            <strong>{zh ? "一只狐，几种命运" : "One fox. Many lives."}</strong>
            <span>
              {zh
                ? "从青丘山的异兽，读到东亚的狐传说"
                : "From Mount Qingqiu to the fox tales of East Asia"}
            </span>
            <small>
              {zh ? "封面：当代视觉演绎" : "Cover: contemporary interpretation"}
            </small>
          </span>
        </Link>
      </section>

      <section id="atlas" className="journey-atlas">
        <div className="journey-section-heading">
          <div>
            <p className="eyebrow">01 / ATLAS</p>
            <h2>{zh ? "故事，从哪里开始？" : "Where does a story begin?"}</h2>
          </div>
          <p>
            {zh
              ? "选择一个体系，先看几则故事，再走进它的世界。"
              : "Choose a tradition, preview a few stories, and find your way in."}
          </p>
        </div>
        <Suspense
          fallback={
            <div className="atlas-loading">
              {zh ? "正在展开地图…" : "Opening the atlas…"}
            </div>
          }
        >
          <WorldMap traditions={mapTraditions} pins={mapPins} locale={locale} />
        </Suspense>
        <p className="atlas-earth-link">
          <Link href={`/${locale}/compare/sunken-worlds`}>
            {zh
              ? "陆地沉没之后：并读姆大陆与亚特兰蒂斯 →"
              : "After the land sinks: read Mu alongside Atlantis →"}
          </Link>
        </p>
      </section>

      <section className="journey-trails">
        <Link href={`/${locale}/themes/foxes`}>
          <p className="eyebrow">
            02 / {zh ? "沿着一个母题读" : "FOLLOW A MOTIF"}
          </p>
          <h2>{zh ? "东亚狐传说" : "Foxes of East Asia"}</h2>
          <p>
            {zh
              ? "山中异兽、宫廷妖狐、家中的陌生人。并读三个传统，留意它们的差异。"
              : "A mountain creature, a courtly apparition, a stranger within a family. Read three traditions side by side."}
          </p>
          <span>{zh ? "打开专题" : "Open the reading trail"}</span>
        </Link>
        <Link href={`/${locale}/compare`}>
          <p className="eyebrow">
            03 / {zh ? "比较一个过程" : "COMPARE A SEQUENCE"}
          </p>
          <h2>{zh ? "洪水之后，世界如何继续？" : "What follows the flood?"}</h2>
          <p>
            {zh
              ? "舟船、山地、放鸟与重建。把四则叙事沿着同一组问题展开，看看它们在哪里相遇，又在哪里分开。"
              : "Vessels, mountains, birds and renewal. Align four accounts around shared questions and discover where their paths diverge."}
          </p>
          <span>{zh ? "阅读与比较" : "Read and compare"}</span>
        </Link>
      </section>

      <section className="journey-collection">
        <div className="journey-section-heading">
          <div>
            <p className="eyebrow">04 / COLLECTION</p>
            <h2>{zh ? "翻开另一页" : "Turn another leaf"}</h2>
          </div>
          <Link className="button-secondary" href={`/${locale}/dex`}>
            {zh ? "搜索全部条目" : "Search all records"}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {curated.map((card) => {
            const t = traditions.find((t) => t.id === card.tradition)!;
            return (
              <EntryCard
                key={card.id}
                entry={card}
                tradition={{ shortName: t.shortName[locale], color: t.color }}
                locale={locale}
              />
            );
          })}
        </div>
        <details className="all-traditions">
          <summary>
            {zh
              ? `按体系浏览全部 ${traditions.length} 个收藏`
              : `Browse all ${traditions.length} traditions`}
          </summary>
          <div className="tradition-directory">
            {CATEGORIES.map((category) => (
              <section key={category}>
                <h3>{categoryLabels[category][locale]}</h3>
                {traditions
                  .filter((t) => t.category === category)
                  .map((t) => (
                    <Link key={t.id} href={`/${locale}/tradition/${t.id}`}>
                      <span>{t.name[locale]}</span>
                      <small>{t.entryCount}</small>
                    </Link>
                  ))}
              </section>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
