import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NarrativeCompare from "@/components/NarrativeCompare";
import topic from "../../../../../data/comparisons/sunken-worlds.json";
import type { ComparisonTopic } from "@/lib/comparison";
import { isLocale } from "@/lib/i18n";
import "../compare.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "沉没的世界 · 姆大陆与亚特兰蒂斯"
        : "Sunken worlds · Mu and Atlantis",
    description:
      locale === "zh"
        ? "沿着繁盛、灾变、沉没与幸存，并读姆大陆和亚特兰蒂斯，辨认相似的过程与不同的结局。"
        : "Compare Mu and Atlantis through prosperity, catastrophe, submergence and survival, with sources for each account.",
  };
}

export default async function SunkenWorldsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  return (
    <div className="site-shell comparison-page">
      <nav
        className="comparison-topics"
        aria-label={zh ? "对照专题" : "Comparison topics"}
      >
        <Link href={`/${locale}/compare`}>
          {zh ? "01 洪水之后" : "01 After the flood"}
        </Link>
        <Link href={`/${locale}/compare/sunken-worlds`} aria-current="page">
          {zh ? "02 沉没的世界" : "02 Sunken worlds"}
        </Link>
      </nav>
      <header className="comparison-hero sunken-hero">
        <div>
          <p className="eyebrow">PATTERNS ACROSS WORLDS / 02</p>
          <h1>
            {zh
              ? "陆地沉没之后，\n故事留下什么？"
              : "When land disappears,\nwhat remains?"}
          </h1>
          <p>
            {zh
              ? "从太平洋的姆大陆，到大西洋的亚特兰蒂斯。"
              : "From Mu in the Pacific to Atlantis in the Atlantic."}
          </p>
          <span>
            {zh
              ? "繁盛的国度、突如其来的灾变、被海水吞没的家园。把两则叙事放在一起，既看相似的转折，也看幸存、衰退与记忆如何走向不同的结局。"
              : "Prosperous realms, catastrophe and homelands engulfed by water. Follow the echoes, then see how survival, loss and remembrance lead in different directions."}
          </span>
          <a className="button-primary" href="#narratives">
            {zh ? "并读姆大陆与亚特兰蒂斯" : "Read Mu alongside Atlantis"} ↓
          </a>
        </div>
        <figure className="sunken-map">
          <Image
            src="/images/entries/mu.jpg"
            alt={
              zh
                ? "丘奇沃德绘制的姆大陆想象地图"
                : "Churchward’s imagined map of Mu"
            }
            width={1000}
            height={787}
            sizes="(max-width: 760px) 100vw, 40vw"
          />
          <figcaption>
            <span>{zh ? "一幅传说中的地图" : "A map of an imagined land"}</span>
            {zh
              ? "丘奇沃德所绘 · 公有领域。呈现作者的设想，并非古地理复原。"
              : "Drawn by Churchward · public domain. The author’s proposal, not a reconstruction of ancient geography."}
            <a
              href="https://commons.wikimedia.org/wiki/File:Golden-age-mu-map.jpg"
              target="_blank"
              rel="noreferrer"
            >
              {zh ? "查看图源" : "Image source"} ↗
            </a>
          </figcaption>
        </figure>
      </header>
      <section
        className="account-dates"
        aria-label={zh ? "版本年代" : "Dates of the accounts"}
      >
        <div>
          <p className="eyebrow">
            {zh ? "先认清：谁在何时讲述" : "WHO TELLS THE STORY, AND WHEN?"}
          </p>
          <p>
            {zh
              ? "以下标的是文本年代。故事自称的远古年代，不作为已经证实的历史日期。"
              : "These dates belong to the texts. Dates claimed inside a story are not treated as established historical dates."}
          </p>
        </div>
        <div>
          <span>{zh ? "公元前 4 世纪" : "4th century BCE"}</span>
          <h2>{zh ? "柏拉图的亚特兰蒂斯" : "Plato’s Atlantis"}</h2>
          <p>
            {zh
              ? "合读《蒂迈欧篇》与《克里提亚篇》。"
              : "Timaeus and Critias, read together."}
          </p>
        </div>
        <div>
          <span>1926 → 1931</span>
          <h2>{zh ? "丘奇沃德的姆大陆" : "Churchward’s Mu"}</h2>
          <p>
            {zh
              ? "1926 年初版；本次对照采用 1931 年版本。近代神秘学叙事。"
              : "First published in 1926; this comparison uses the 1931 account. Modern esoteric writing."}
          </p>
        </div>
      </section>
      <div id="narratives">
        <Suspense
          fallback={
            <p className="atlas-loading">
              {zh ? "正在展开对照…" : "Opening the comparison…"}
            </p>
          }
        >
          <NarrativeCompare topic={topic as ComparisonTopic} locale={locale} />
        </Suspense>
      </div>
      <section className="comparison-context">
        <div>
          <p className="eyebrow">
            {zh ? "把问题带回洪水" : "RETURN TO THE FLOOD"}
          </p>
          <h2>
            {zh
              ? "幸存之后，一定是新生吗？"
              : "Does survival always mean renewal?"}
          </h2>
          <p>
            {zh
              ? "水淹没世界，是相似的转折；此后的生活却可能是重建、衰退，或文本没有交代的空白。继续比较洪水故事，看看舟船、山地、治水与耕作把叙事带向哪里。"
              : "Water engulfing a world is a shared turning point. What follows may be rebuilding, loss or an unstated future. Compare flood accounts to follow vessels, mountains, waterworks and cultivation."}
          </p>
          <Link href={`/${locale}/compare#narratives`}>
            {zh
              ? "继续比较洪水与灾后生活"
              : "Compare floods and life afterwards"}{" "}
            →
          </Link>
        </div>
        <div>
          <p className="eyebrow">
            {zh ? "沿着失落之地继续读" : "MORE LOST LANDS"}
          </p>
          <h2>
            {zh
              ? "相似的名字，各自的来历"
              : "Related names, distinct histories"}
          </h2>
          <p>
            {zh
              ? "沉没大陆与失落城池可以放在一起阅读，但每一则都需要自己的版本与出处。相似的图景，是比较的起点。"
              : "Sunken continents and lost cities invite comparison. Each still needs its own account and sources; resemblance is a starting point."}
          </p>
          <div className="sunken-related">
            <Link href={`/${locale}/entry/lemuria`}>
              {zh ? "雷姆利亚" : "Lemuria"} →
            </Link>
            <Link href={`/${locale}/entry/ys`}>{zh ? "伊斯城" : "Ys"} →</Link>
            <Link href={`/${locale}/tradition/lost-lands`}>
              {zh ? "全部失落之地" : "All lost lands"} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
