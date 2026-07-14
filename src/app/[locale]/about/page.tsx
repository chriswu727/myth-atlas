import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getEntries, getTraditions } from "@/lib/data";
import { dict, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: dict.about.title[locale] };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const withImages = getEntries().filter((e) => e.image);
  const traditionName = new Map(getTraditions().map((t) => [t.id, t.shortName[locale]]));

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12">
      <h1 className="text-4xl">{dict.about.title[locale]}</h1>
      <div className="prose-myth mt-8 leading-[1.9] text-vellum-dim">
        <p>{dict.about.method[locale]}</p>
        <p>{dict.about.images[locale]}</p>
      </div>

      {withImages.length > 0 && (
        <section className="mt-12">
          <h2 className="eyebrow border-b hairline pb-2">{dict.about.credits[locale]}</h2>
          <ul className="mt-4 space-y-2 text-sm text-vellum-dim">
            {withImages.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-2">
                <Link href={`/${locale}/entry/${e.id}`} className="text-vellum hover:text-brass">
                  {locale === "zh" ? e.name.zh : e.name.en}
                </Link>
                <span className="catalog-no">{traditionName.get(e.tradition)}</span>
                <span>
                  — {e.image!.artist ? `${e.image!.artist}, ` : ""}
                  <a
                    href={e.image!.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-brass"
                  >
                    {e.image!.sourceTitle ?? "Wikimedia Commons"}
                  </a>{" "}
                  ({e.image!.license})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
