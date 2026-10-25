import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CosmogonyExplorer from "@/components/CosmogonyExplorer";
import CosmogonyCompare from "@/components/CosmogonyCompare";
import { toInteractiveCosmogony } from "@/components/CosmogonyTimeline";
import { getCosmogonies } from "@/lib/data";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh" ? "时间线对比 · 太初纪" : "Narrative timelines · Origins",
  };
}
export default async function CosmogonyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  const stories = getCosmogonies().map((story) =>
    toInteractiveCosmogony(story, locale),
  );
  return (
    <div className="site-shell origins-page">
      <header className="reading-page-header">
        <div>
          <p className="eyebrow">
            BEFORE THE WORLD / {stories.length}{" "}
            {zh ? "组创世叙事" : "ORIGIN COLLECTIONS"}
          </p>
          <h1>{zh ? "时间线对比" : "Narrative timelines"}</h1>
        </div>
        <div>
          <p>
            {zh ? "天地，曾有许多种开端。" : "The world has many beginnings."}
          </p>
          <span>
            {zh
              ? "并排看见不同传统的开端，也沿各自的顺序读下去。"
              : "Compare beginnings across traditions, and follow each account in its own order."}
          </span>
          <a href="#reader">
            {zh ? "阅读单个创世故事" : "Read one origin story"}
          </a>
        </div>
      </header>
      <p className="origins-comparison-link">
        <Link href={`/${locale}/compare`}>
          {zh
            ? "新专题：把洪水、幸存与新生的过程并排来看 →"
            : "New: compare the sequence of flood, survival and renewal →"}
        </Link>
      </p>
      <Suspense
        fallback={
          <div className="atlas-loading">
            {zh ? "正在展开故事…" : "Opening the stories…"}
          </div>
        }
      >
        <CosmogonyCompare stories={stories} locale={locale} />
        <section id="reader" className="origins-reader-section">
          <h2>{zh ? "沿着一个故事读下去" : "Follow one story"}</h2>
          <CosmogonyExplorer stories={stories} locale={locale} />
        </section>
      </Suspense>
    </div>
  );
}
