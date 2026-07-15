import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CosmogonyExplorer from "@/components/CosmogonyExplorer";
import { toInteractiveCosmogony } from "@/components/CosmogonyTimeline";
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
  const interactiveStories = cosmogonies.map((cosmogony) => toInteractiveCosmogony(cosmogony, locale));

  return (
    <div className="site-shell pt-12">
      <header className="grid gap-8 border-b border-[var(--line-strong)] pb-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <p className="eyebrow">{locale === "zh" ? "在日月尚未升起以前" : "BEFORE THE SUN AND MOON ASCENDED"}</p>
          <h1 className="mt-4 text-7xl leading-[0.9] sm:text-9xl">{dict.cosmogony.title[locale]}</h1>
        </div>
        <div className="reading-rule">
          <p className="text-xl leading-[1.8] text-vellum-dim">{dict.cosmogony.lede[locale]}</p>
          <p className="catalog-no mt-4">{cosmogonies.length} {locale === "zh" ? "部创世残卷" : "chronicles of origin"}</p>
        </div>
      </header>

      <section className="mt-16">
        <div className="section-heading">
          <h2 className="text-3xl">
            {locale === "zh" ? `${cosmogonies.length}次天地初醒` : `${cosmogonies.length} awakenings of the world`}
          </h2>
          <span className="catalog-no">{cosmogonies.length}</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-vellum-dim">
          {locale === "zh"
            ? "择一方古域，循年表逐幕下行。每一次移步，都是从无形深处向此世逼近。"
            : "Choose an elder realm and descend through its chronicle, each step drawing nearer from the formless deep to the world that remains."}
        </p>
        <div className="mt-7">
          <CosmogonyExplorer stories={interactiveStories} locale={locale} />
        </div>
      </section>

      <section className="mt-20">
        <div className="section-heading">
          <h2 className="text-3xl">{dict.cosmogony.compare[locale]}</h2>
          <span className="catalog-no">{cosmogonies.length}</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-vellum-dim">{dict.cosmogony.compareHint[locale]}</p>

        <div className="paper-panel mt-6 overflow-x-auto">
          <table className="cosmogony-table w-max table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-36 bg-[var(--paper-pale)] px-3 py-3 text-left align-bottom">
                  <span className="eyebrow">{locale === "zh" ? "神话谱系" : "Tradition"}</span>
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
                  <th className="sticky left-0 z-10 border-b hairline bg-[var(--paper-pale)] px-3 py-4 text-left font-normal">
                    <Link
                      href={`/${locale}/tradition/${t.id}`}
                      className="group flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="h-2 w-2 rotate-45" style={{ backgroundColor: t.color }} />
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

    </div>
  );
}
