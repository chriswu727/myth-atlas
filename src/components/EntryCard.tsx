import Image from "next/image";
import Link from "next/link";
import Emblem from "@/components/Emblem";
import { eraLabels, typeLabels } from "@/lib/i18n";
import type { EntryCardData, Locale } from "@/lib/types";

export interface CardTradition {
  shortName: string;
  color: string;
}

export default function EntryCard({
  entry,
  tradition,
  locale,
}: {
  entry: EntryCardData;
  tradition: CardTradition;
  locale: Locale;
}) {
  const primary = locale === "zh" ? entry.nameZh : entry.nameEn;
  const secondary = locale === "zh" ? entry.nameEn : entry.nameZh;

  return (
    <Link href={`/${locale}/entry/${entry.id}`} className="card-link group">
      <article className="content-auto">
        <div className="entry-card-figure aspect-[3/4]">
          {entry.image ? (
            <Image
              src={entry.image.file}
              alt={primary}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-cover"
            />
          ) : (
            <Emblem type={entry.type} color={tradition.color} name={entry.original ?? entry.nameZh} />
          )}
          <span
            className="absolute top-0 left-0 z-[2] px-2 py-1 font-[family-name:var(--font-mono-stack)] text-[0.58rem] tracking-[0.08em] text-[var(--paper-pale)]"
            style={{ backgroundColor: tradition.color }}
          >
            № {entry.catalog}
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3 border-t border-[var(--line)] pt-2">
          <div className="min-w-0">
            <p className="catalog-no truncate">{entry.volume ?? tradition.shortName}</p>
            <h3 className="mt-1 text-xl leading-[1.05] transition-colors">{primary}</h3>
          </div>
          <span className="catalog-no shrink-0 text-right" style={{ color: tradition.color }}>
            {typeLabels[entry.type][locale]}<br />
            {eraLabels[entry.era][locale]}
          </span>
        </div>
        <p className="mt-1 truncate font-[family-name:var(--font-display-stack)] text-xs tracking-[0.08em] text-vellum-faint">
          {secondary}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-vellum-dim">{entry.title}</p>
      </article>
    </Link>
  );
}
