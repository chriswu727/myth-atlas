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
      locale === "zh"
        ? "太初纪 · 创世故事与比较"
        : "Origins · Stories and comparisons",
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
          <h1>{zh ? "太初纪" : "Before the World"}</h1>
        </div>
        <div>
          <p>
            {zh ? "天地，曾有许多种开端。" : "The world has many beginnings."}
          </p>
          <span>
            {zh
              ? "在诸神的故事里读一遍，再把不同传统并排来看。"
              : "Follow a story of the gods, then read across traditions."}
          </span>
          <a href="#compare">
            {zh ? "直接比较创世母题" : "Compare creation motifs"}
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
        <CosmogonyExplorer stories={stories} locale={locale} />
        <CosmogonyCompare stories={stories} locale={locale} />
      </Suspense>
    </div>
  );
}
