import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NarrativeCompare from "@/components/NarrativeCompare";
import flood from "../../../../data/comparisons/flood.json";
import type { ComparisonTopic } from "@/lib/comparison";
import { isLocale } from "@/lib/i18n";
import "./compare.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "神话对照 · 洪水之后，世界如何继续"
        : "Myths compared · Life after the flood",
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  return (
    <div className="site-shell comparison-page">
      <header className="comparison-hero">
        <div>
          <p className="eyebrow">PATTERNS ACROSS WORLDS / 01</p>
          <h1>
            {zh
              ? "洪水之后，\n世界如何继续？"
              : "After the flood,\nhow does life continue?"}
          </h1>
          <p>
            {zh
              ? "相隔千里的故事，在某些转折处彼此呼应。"
              : "Stories from different places echo at particular turns."}
          </p>
          <span>
            {zh
              ? "并读两河、希伯来《创世记》、希腊与中国的四则叙事，沿着灾难、幸存与此后的生活，发现共同的过程，也留意各自的方向。"
              : "Read four accounts from Mesopotamia, Hebrew Genesis, Greece and China. Trace catastrophe, survival and life afterwards, noticing both recurring patterns and different paths."}
          </span>
          <a className="button-primary" href="#narratives">
            {zh ? "展开过程对照" : "Explore the comparison"} ↓
          </a>
        </div>
        <aside className="comparison-opening">
          <p className="eyebrow">
            {zh ? "一条共同的问题" : "A SHARED QUESTION"}
          </p>
          <ol>
            <li>
              <span>01</span>
              {zh ? "水淹没了熟悉的世界" : "Water overtakes a familiar world"}
            </li>
            <li>
              <span>02</span>
              {zh ? "生命怎样被保留下来" : "How can life be preserved?"}
            </li>
            <li>
              <span>03</span>
              {zh ? "人如何再次生活" : "How do people live again?"}
            </li>
          </ol>
          <p>
            {zh
              ? "舟船、山地、放鸟、献祭……有些细节再次出现；有些故事则转向治水与耕作。"
              : "Vessels, mountains, birds and offerings recur. Another account turns toward water management and cultivation."}
          </p>
        </aside>
      </header>
      <div id="narratives">
        <Suspense
          fallback={
            <p className="atlas-loading">
              {zh ? "正在展开对照…" : "Opening the comparison…"}
            </p>
          }
        >
          <NarrativeCompare topic={flood as ComparisonTopic} locale={locale} />
        </Suspense>
      </div>
      <section className="comparison-context">
        <div>
          <p className="eyebrow">
            {zh ? "读出相似，也读出距离" : "SIMILARITY AND DISTANCE"}
          </p>
          <h2>
            {zh ? "相似之后，还可以问什么？" : "What follows a resemblance?"}
          </h2>
          <p>
            {zh
              ? "这四列各自对应明确文本，不代表四个完全独立的起源。相似可以成为追问交流、环境与叙事方式的起点；要判断传播，还需要文献年代、接触史和更具体的证据。"
              : "These columns represent specified texts, not four proven independent origins. Resemblance invites questions about contact, environments and storytelling; transmission needs dating and historical evidence."}
          </p>
          <Link href={`/${locale}/cosmogony#compare`}>
            {zh ? "继续比较创世母题" : "Compare creation motifs"} →
          </Link>
        </div>
        <div>
          <p className="eyebrow">
            DEEP TIME / {zh ? "大陆与人类" : "LAND AND PEOPLE"}
          </p>
          <h2>
            {zh
              ? "如果大陆曾经相连呢？"
              : "What if the continents were once joined?"}
          </h2>
          <p>
            {zh
              ? "从泛大陆到今天的地理格局，地球有另一条漫长的时间线。先看清地质年代与人类历史的尺度，再把问题带回故事。"
              : "From Pangaea to today's geography, Earth has its own long timeline. Explore its scale alongside human history, then return to the stories."}
          </p>
          <Link href={`/${locale}/earth`}>
            {zh ? "阅读泛大陆与深时" : "Explore Pangaea and deep time"} →
          </Link>
        </div>
      </section>
    </div>
  );
}
