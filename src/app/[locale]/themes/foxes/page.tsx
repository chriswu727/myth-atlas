import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReturnLink from "@/components/ReturnLink";
import { getDisplayImage, getEntry } from "@/lib/data";
import { isLocale } from "@/lib/i18n";
import { FOX_ENTRIES } from "@/lib/editorial";
import { atlasUrl } from "@/lib/navigation";

const readings = [
  {
    id: FOX_ENTRIES[0],
    place: { zh: "中国 ·《山海经》", en: "China · Shanhaijing" },
    title: { zh: "先是一头山中异兽", en: "First, a creature of the mountains" },
    text: {
      zh: "从《南山经》的青丘之山读起。这里的狐有九尾，声音像婴儿，会吃人；经文没有给它一段宫廷身世。先记住这副形貌，再看后世的讲法。",
      en: "Begin at Mount Qingqiu in the Southern Mountains. This fox has nine tails, cries like an infant, and eats people. The passage gives it no courtly biography. Keep this creature in mind as you turn to later tales.",
    },
    question: { zh: "留意：形貌与栖居地", en: "Notice: form and habitat" },
    source: "https://ctext.org/wiki.pl?chapter=593875&if=gb",
    sourceName: {
      zh: "《山海经·南山经》影印与录文",
      en: "Shanhaijing · Southern Mountains",
    },
  },
  {
    id: FOX_ENTRIES[1],
    place: { zh: "日本 · 玉藻前", en: "Japan · Tamamo-no-Mae" },
    title: { zh: "走进宫廷的狐", en: "The fox at court" },
    text: {
      zh: "玉藻前的故事把妖狐带进宫廷。史密森尼所藏月冈芳年的版画以女子形象表现这位狐灵，馆藏说明也记录了后来将她与印度、中国、日本宫廷联系起来的传说。那是故事中的行旅，不能直接当作民俗传播的路线图。",
      en: "Tamamo-no-Mae brings the fox into the imperial court. A Yoshitoshi print in the Smithsonian collection depicts her in human form; its commentary records a legend connecting courts in India, China, and Japan. A journey within a legend does not, by itself, establish a route of cultural transmission.",
    },
    question: {
      zh: "留意：人物身份与后世叙事",
      en: "Notice: identity and later retellings",
    },
    source: "https://asia-archive.si.edu/object/S2004.3.318/",
    sourceName: {
      zh: "史密森尼国立亚洲艺术博物馆：玉藻前图版",
      en: "Smithsonian National Museum of Asian Art · Tamamo-no-Mae",
    },
  },
  {
    id: FOX_ENTRIES[2],
    place: { zh: "朝鲜半岛 · 狐故事", en: "Korea · Fox tales" },
    title: { zh: "家中的陌生人", en: "A stranger within the family" },
    text: {
      zh: "把视线从宫廷移到家庭。《狐狸妹妹》围绕狐化身的妹妹与兄长展开，《狐珠》则讲另一种人与狐的相遇。韩国国立民俗博物馆的民间文学百科分别收录这两类故事；阅读时应保留各自的情节和异本。",
      en: "Move from the court to the family. The Fox Sister centers on a brother and a sister who is a fox; Fox Marble tells a different kind of encounter. The National Folk Museum of Korea catalogs them separately. Read each tale with its own plot and variants intact.",
    },
    question: {
      zh: "留意：故事类型与版本差异",
      en: "Notice: tale types and variants",
    },
    source: "https://folkency.nfm.go.kr/api/file/download/dictionary/82",
    sourceName: {
      zh: "韩国国立民俗博物馆：民间文学百科，Fox Marble / Fox Sister",
      en: "National Folk Museum of Korea · Encyclopedia of Korean Folk Literature, Fox Marble / Fox Sister",
    },
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
        ? "东亚狐传说 · 一只狐，几种命运"
        : "Foxes of East Asia · One fox, many lives",
  };
}
export default async function FoxTrail({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const zh = locale === "zh";
  return (
    <div className="site-shell fox-trail">
      <nav className="reading-breadcrumb">
        <Suspense>
          <ReturnLink locale={locale} />
        </Suspense>
        <Link href={atlasUrl(locale, "shanhaijing")}>
          {zh ? "回到东亚地图" : "Return to the East Asian atlas"}
        </Link>
      </nav>
      <header className="reading-page-header">
        <div>
          <p className="eyebrow">
            READING TRAIL 01 / {zh ? "东亚狐传说" : "FOXES OF EAST ASIA"}
          </p>
          <h1>{zh ? "一只狐，\n几种命运" : "One fox.\nMany lives."}</h1>
        </div>
        <div>
          <p>
            {zh
              ? "从形貌相似的地方，读出故事的不同。"
              : "Begin with a resemblance. Read for the differences."}
          </p>
          <span>
            {zh
              ? "三个阅读入口，各自有文本与图像依据。本专题将它们并置，不预设一条从中国到日韩的单线传播史。"
              : "Three reading stops, grounded in texts and images. This trail places them alongside one another without assuming a single line of descent."}
          </span>
          <a href="#trail-1">
            {zh ? "从青丘山开始" : "Begin at Mount Qingqiu"}
          </a>
        </div>
      </header>
      <nav
        className="trail-index"
        aria-label={zh ? "专题目录" : "Reading trail contents"}
      >
        {readings.map((reading, index) => (
          <a key={reading.id} href={`#trail-${index + 1}`}>
            <span>0{index + 1}</span>
            {reading.place[locale]}
          </a>
        ))}
      </nav>
      {readings.map((reading, index) => {
        const entry = getEntry(reading.id)!;
        const picture = getDisplayImage(entry)!;
        return (
          <section
            className="trail-stop"
            id={`trail-${index + 1}`}
            key={entry.id}
          >
            <div className="trail-image">
              <Image
                src={picture.file}
                alt={entry.name[locale]}
                width={picture.width ?? 1000}
                height={picture.height ?? 1250}
                sizes="(max-width: 760px) 90vw, 35vw"
              />
              <small>
                {index === 0
                  ? zh
                    ? "当代视觉演绎"
                    : "Contemporary interpretation"
                  : zh
                    ? "条目资料图 · 来源见完整条目"
                    : "Record image · provenance in the full entry"}
              </small>
            </div>
            <div>
              <p className="eyebrow">
                0{index + 1} / {reading.place[locale]}
              </p>
              <h2>{reading.title[locale]}</h2>
              <p>{reading.text[locale]}</p>
              <p className="trail-question">{reading.question[locale]}</p>
              <Link
                className="button-primary"
                href={`/${locale}/entry/${entry.id}?returnTo=${encodeURIComponent(`/${locale}/themes/foxes#trail-${index + 1}`)}`}
              >
                {zh ? `阅读${entry.name.zh}条目` : `Read ${entry.name.en}`}
              </Link>
              <a
                className="trail-source"
                href={reading.source}
                target="_blank"
                rel="noreferrer"
              >
                {reading.sourceName[locale]}
              </a>
            </div>
          </section>
        );
      })}
      <section className="trail-end">
        <p className="eyebrow">
          {zh ? "带着一个问题继续读" : "TAKE A QUESTION WITH YOU"}
        </p>
        <h2>
          {zh
            ? "相似的尾巴，是否意味着相同的故事？"
            : "Does a shared likeness mean a shared story?"}
        </h2>
        <p>
          {zh
            ? "比较它出现在哪里、与谁相遇、故事由谁记录。下一次遇见熟悉的形象，也给它的不同版本留一个位置。"
            : "Compare where it appears, whom it meets, and who records its story. Leave room for the different accounts behind a familiar image."}
        </p>
        <Link
          className="button-secondary"
          href={`/${locale}/dex?q=${encodeURIComponent(zh ? "狐" : "fox")}`}
        >
          {zh ? "在图鉴里继续寻找狐" : "Find more foxes in the collection"}
        </Link>
      </section>
    </div>
  );
}
