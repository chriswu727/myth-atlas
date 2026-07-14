import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCosmogonies, getTradition } from "@/lib/data";
import { dict, isLocale, motifLabels } from "@/lib/i18n";
import { MOTIFS, type Motif } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: dict.cosmogony.title[locale], description: dict.cosmogony.lede[locale] };
}

export default async function CosmogonyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const cosmogonies = getCosmogonies();

  const rows = cosmogonies.map((c) => {
    const t = getTradition(c.tradition)!;
    /* One tradition can hit a motif more than once (the Maya make people three
       times); keep them all so the cell shows the whole sequence. */
    const byMotif = new Map<Motif, typeof c.stages>();
    for (const s of c.stages) {
      if (!byMotif.has(s.motif)) byMotif.set(s.motif, []);
      byMotif.get(s.motif)!.push(s);
    }
    return { c, t, byMotif };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12">
      <header className="max-w-3xl">
        <p className="eyebrow">{locale === "zh" ? "世界如何开始" : "HOW THE WORLD BEGAN"}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{dict.cosmogony.title[locale]}</h1>
        <p className="mt-5 leading-[1.9] text-vellum-dim">{dict.cosmogony.lede[locale]}</p>
      </header>

      <section className="mt-12">
        <div className="flex items-baseline justify-between border-b hairline pb-2">
          <h2 className="text-xl">{dict.cosmogony.compare[locale]}</h2>
          <span className="catalog-no">{cosmogonies.length}</span>
        </div>
        <p className="catalog-no mt-2 leading-relaxed">{dict.cosmogony.compareHint[locale]}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-max table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-36 bg-ink px-3 py-2 text-left align-bottom">
                  <span className="eyebrow">{locale === "zh" ? "体系" : "Tradition"}</span>
                </th>
                {MOTIFS.map((m) => (
                  <th
                    key={m}
                    className="w-56 border-b hairline px-3 py-2 text-left align-bottom font-normal"
                  >
                    <span className="eyebrow">{motifLabels[m][locale]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, t, byMotif }) => (
                <tr key={c.tradition} className="align-top">
                  <th className="sticky left-0 z-10 border-b hairline bg-ink px-3 py-4 text-left font-normal">
                    <Link
                      href={`/${locale}/tradition/${t.id}`}
                      className="group flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg viewBox="0 0 14 14" className="h-3 w-3 shrink-0" aria-hidden="true">
                        <path
                          d="M7,0.5 L8.7,5.3 L13.5,7 L8.7,8.7 L7,13.5 L5.3,8.7 L0.5,7 L5.3,5.3 Z"
                          fill={t.color}
                        />
                      </svg>
                      <span className="group-hover:text-brass">{t.shortName[locale]}</span>
                    </Link>
                  </th>
                  {MOTIFS.map((m) => {
                    const stages = byMotif.get(m);
                    return (
                      <td key={m} className="border-b hairline px-3 py-4">
                        {stages ? (
                          <div className="space-y-2">
                            {stages.map((s, i) => (
                              <div key={i}>
                                <p className="leading-snug text-vellum">{s.title[locale]}</p>
                                <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-vellum-faint">
                                  {s.text[locale]}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-vellum-faint opacity-40">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="border-b hairline pb-2 text-xl">
          {locale === "zh" ? "逐个体系" : "One tradition at a time"}
        </h2>
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ c, t }) => (
            <Link
              key={c.tradition}
              href={`/${locale}/tradition/${t.id}`}
              className="group border hairline p-4 transition-colors hover:border-[var(--brass)]"
            >
              <p className="flex items-center gap-2">
                <svg viewBox="0 0 14 14" className="h-3 w-3 shrink-0" aria-hidden="true">
                  <path
                    d="M7,0.5 L8.7,5.3 L13.5,7 L8.7,8.7 L7,13.5 L5.3,8.7 L0.5,7 L5.3,5.3 Z"
                    fill={t.color}
                  />
                </svg>
                <span className="group-hover:text-brass">{t.name[locale]}</span>
              </p>
              <p className="catalog-no mt-2 line-clamp-2 leading-relaxed">{c.source[locale]}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-vellum-dim">
                {c.stages[0]?.title[locale]} → {c.stages[c.stages.length - 1]?.title[locale]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
