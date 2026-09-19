import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DeepTimeScale from "@/components/DeepTimeScale";
import { isLocale } from "@/lib/i18n";
import "./earth.css";

const chapters = [
  {
    id: "pangaea",
    time: { zh: "约三亿至两亿年前", en: "About 300–200 million years ago" },
    title: { zh: "大陆曾聚成一片", en: "Continents joined together" },
    text: {
      zh: "泛大陆，也称盘古大陆，是地质学中的超级大陆。在这段漫长时期，今天分隔的北美洲、非洲、南美洲与欧洲曾相连。这里的“盘古”是一种中文译名，不是以盘古神话作为地质证据。",
      en: "Pangaea was a geological supercontinent. During this long interval, the lands now called North America, Africa, South America and Europe were connected. Its Chinese name Pangu Dalu is a translation; the Pangu myth is not geological evidence.",
    },
    source:
      "https://www.usgs.gov/faqs/what-was-pangea?items_per_page=6&page=0&qt-news_science_products=0",
    label: "USGS · What was Pangea?",
  },
  {
    id: "drift",
    time: {
      zh: "约两亿年前开始",
      en: "Beginning around 200 million years ago",
    },
    title: {
      zh: "海洋在分离的大陆间展开",
      en: "Oceans open between continents",
    },
    text: {
      zh: "泛大陆逐渐裂解，大陆随板块移动，经过极长的时间形成今天的地理格局。岸线的拼合、跨大陆对应的岩层与化石，构成研究大陆漂移的重要线索。这个过程远早于人类出现。",
      en: "Pangaea gradually broke apart. Continents moved with tectonic plates over immense spans of time. Matching coastlines, rock formations and fossils helped reveal that history. The breakup began long before humans appeared.",
    },
    source: "https://pubs.usgs.gov/gip/dynamic/historical.html",
    label: "USGS · This Dynamic Earth: Historical perspective",
  },
  {
    id: "people",
    time: { zh: "约三十万年前至今", en: "About 300,000 years ago to today" },
    title: {
      zh: "讲故事的人，出现得很晚",
      en: "The storytellers arrive much later",
    },
    text: {
      zh: "智人在非洲出现，随后的人类历史包含迁徙、定居与交流。追问不同地方的故事为何相似，需要在这个近得多的时间尺度里寻找证据。大陆曾经相连，不能直接解释神话之间的联系。",
      en: "Homo sapiens emerged in Africa. Human history includes migration, settlement and exchange. Questions about related stories require evidence on this much shorter timescale; the ancient joining of continents does not establish a connection between myths.",
    },
    source:
      "https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens",
    label: "Smithsonian · Homo sapiens",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "zh"
        ? "大陆与深时 · 从泛大陆到讲故事的人"
        : "Land and deep time · From Pangaea to people",
  };
}

export default async function EarthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  return (
    <div className="site-shell earth-page">
      <nav className="reading-breadcrumb">
        <Link href={`/${locale}/compare`}>
          ← {zh ? "回到神话对照" : "Back to the comparison"}
        </Link>
        <Link href={`/${locale}#atlas`}>
          {zh ? "打开世界地图" : "Open the world map"}
        </Link>
      </nav>
      <header className="earth-header">
        <p className="eyebrow">
          DEEP TIME / {zh ? "大陆与人类" : "LAND AND PEOPLE"}
        </p>
        <h1>
          {zh
            ? "在故事之前，\n大陆已经走了很远。"
            : "Long before the stories,\nthe continents were moving."}
        </h1>
        <p>
          {zh
            ? "从泛大陆的聚合与分裂，走向有人讲述洪水、创世与归返的世界。地球的变化与故事的流传，各有自己的时间尺度。"
            : "From Pangaea's assembly and breakup to a world of flood stories, beginnings and returns. Earth's changes and the movement of stories unfold on different timescales."}
        </p>
      </header>
      <DeepTimeScale locale={locale} />
      <p className="earth-axis-note">
        {zh
          ? "以下按时间先后分段讲述，段落间距不表示等长时间。"
          : "The chapters follow chronological order; their spacing does not represent equal durations."}
      </p>
      <div className="earth-chapters">
        {chapters.map((chapter, index) => (
          <section id={chapter.id} key={chapter.id}>
            <div>
              <span className="eyebrow">0{index + 1}</span>
              <p>{chapter.time[locale]}</p>
            </div>
            <div>
              <h2>{chapter.title[locale]}</h2>
              <p>{chapter.text[locale]}</p>
              <a href={chapter.source} target="_blank" rel="noreferrer">
                {chapter.label} ↗
              </a>
            </div>
          </section>
        ))}
      </div>
      <section className="earth-reading">
        <h2>
          {zh ? "把三种时间放在各自的位置" : "Three different kinds of time"}
        </h2>
        <div>
          <article>
            <h3>{zh ? "地球的时间" : "Earth time"}</h3>
            <p>
              {zh
                ? "大陆、海洋与地貌如何变化，由地质证据和年代测定研究。"
                : "Geological evidence and dating tell us how continents, oceans and landscapes changed."}
            </p>
          </article>
          <article>
            <h3>
              {zh ? "文本与交流的时间" : "The history of texts and contact"}
            </h3>
            <p>
              {zh
                ? "某个故事何时被记录，人群是否相遇。现存记录的年代，也不等于故事首次被讲述的年代。"
                : "When was an account recorded, and who was in contact? A surviving record does not necessarily date a tale's first telling."}
            </p>
          </article>
          <article>
            <h3>{zh ? "故事里的时间" : "Time inside a story"}</h3>
            <p>
              {zh
                ? "洪水之前、幸存之时、灾难之后。它帮助我们比较叙事过程，本身没有给出地质年代。"
                : "Before a flood, during survival, after catastrophe: narrative stages help us compare stories without assigning geological dates."}
            </p>
          </article>
        </div>
        <Link className="button-primary" href={`/${locale}/compare#narratives`}>
          {zh
            ? "带着这个尺度，重新看洪水故事"
            : "Return to the flood stories with this perspective"}{" "}
          →
        </Link>
      </section>
    </div>
  );
}
