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
  const creditGroups = getTraditions()
    .map((tradition) => ({
      tradition,
      entries: withImages.filter((entry) => entry.tradition === tradition.id),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="site-shell pt-12">
      <header className="grid gap-8 border-b border-[var(--line-strong)] pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="eyebrow">{locale === "zh" ? "群卷如何被寻回，诸像从何处借光" : "HOW THE LEAVES WERE FOUND · WHENCE THE PLATES BORROW LIGHT"}</p>
          <h1 className="mt-4 text-7xl leading-none sm:text-9xl">{dict.about.title[locale]}</h1>
        </div>
        <div className="reading-rule prose-myth text-lg leading-[1.9] text-vellum-dim">
          <p>{dict.about.method[locale]}</p>
          <p>{dict.about.images[locale]}</p>
        </div>
      </header>

      {withImages.length > 0 && (
        <section className="mt-16">
          <div className="section-heading">
            <h2 className="text-3xl">{dict.about.credits[locale]}</h2>
            <span className="catalog-no">{withImages.length}</span>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {creditGroups.map(({ tradition, entries }) => (
              <details key={tradition.id} className="paper-panel group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5" style={{ backgroundColor: tradition.color }} />
                    <span className="text-lg">{tradition.name[locale]}</span>
                  </span>
                  <span className="catalog-no">{entries.length}</span>
                </summary>
                <ul className="mt-4 space-y-3 border-t border-[var(--line)] pt-4 text-sm text-vellum-dim">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <Link href={`/${locale}/entry/${entry.id}`} className="text-vellum hover:text-brass">
                        {locale === "zh" ? entry.name.zh : entry.name.en}
                      </Link>
                      <span className="block text-xs leading-relaxed">
                        {entry.image!.artist ? `${entry.image!.artist}, ` : ""}
                        <a href={entry.image!.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-brass">
                          {entry.image!.sourceTitle ?? "Wikimedia Commons"}
                        </a>{" "}
                        ({entry.image!.license})
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
