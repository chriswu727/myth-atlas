import Link from "next/link";
import { getEntry } from "@/lib/data";
import { dict, motifLabels } from "@/lib/i18n";
import type { Cosmogony, Locale } from "@/lib/types";

/* A vertical engraved rail: each stage is a node, its motif is the tick label,
   so the same spine reads across every tradition on the comparison page. */
export default function CosmogonyTimeline({
  cosmogony,
  color,
  locale,
}: {
  cosmogony: Cosmogony;
  color: string;
  locale: Locale;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b hairline pb-2">
        <h2 className="text-xl">{dict.cosmogony.timeline[locale]}</h2>
        <p className="catalog-no">
          {dict.cosmogony.sources[locale]} {cosmogony.source[locale]}
        </p>
      </div>

      {cosmogony.note && (
        <p className="mt-4 border-l-2 pl-4 text-sm leading-relaxed text-vellum-dim" style={{ borderColor: color }}>
          <span className="eyebrow mr-2">{dict.cosmogony.noteLabel[locale]}</span>
          {cosmogony.note[locale]}
        </p>
      )}

      <ol className="mt-8">
        {cosmogony.stages.map((s, i) => {
          const links = (s.entries ?? []).map((id) => getEntry(id)).filter((e) => e != null);
          const last = i === cosmogony.stages.length - 1;
          return (
            <li key={i} className="relative grid grid-cols-[auto_1fr] gap-x-5">
              {/* rail */}
              <div className="relative flex w-4 justify-center">
                {!last && (
                  <span
                    className="absolute top-4 bottom-0 w-px"
                    style={{ background: color, opacity: 0.3 }}
                  />
                )}
                <svg viewBox="0 0 14 14" className="relative mt-[0.35rem] h-3 w-3 shrink-0" aria-hidden="true">
                  <path
                    d="M7,0.5 L8.7,5.3 L13.5,7 L8.7,8.7 L7,13.5 L5.3,8.7 L0.5,7 L5.3,5.3 Z"
                    fill={color}
                  />
                </svg>
              </div>

              <div className={last ? "pb-1" : "pb-9"}>
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="eyebrow" style={{ color }}>
                    {motifLabels[s.motif][locale]}
                  </span>
                  {s.phase[locale] !== motifLabels[s.motif][locale] && (
                    <span className="catalog-no">{s.phase[locale]}</span>
                  )}
                </p>
                <h3 className="mt-1 text-lg leading-snug">{s.title[locale]}</h3>
                <p className="mt-1.5 max-w-prose leading-[1.85] text-vellum-dim">{s.text[locale]}</p>
                {links.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {links.map((e) => (
                      <Link
                        key={e.id}
                        href={`/${locale}/entry/${e.id}`}
                        className="catalog-no underline decoration-[var(--brass-faint)] underline-offset-4 hover:text-brass hover:decoration-[var(--brass)]"
                      >
                        {locale === "zh" ? e.name.zh : e.name.en}
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
