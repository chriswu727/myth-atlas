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
      <article>
        <div className="plate">
          <div className="plate-inner aspect-[4/5]">
            {entry.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.image.file}
                alt={primary}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <Emblem type={entry.type} color={tradition.color} />
            )}
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="catalog-no">
            № {entry.catalog} · {entry.volume ?? tradition.shortName}
          </span>
          <span
            className="catalog-no"
            style={{ color: tradition.color }}
          >
            {typeLabels[entry.type][locale]} · {eraLabels[entry.era][locale]}
          </span>
        </div>
        <h3 className="mt-1 text-lg leading-snug group-hover:text-brass">
          {primary}
          <span className="ml-2 font-[family-name:var(--font-display-stack)] text-xs tracking-[0.14em] text-vellum-faint">
            {secondary}
          </span>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-vellum-dim">{entry.title}</p>
      </article>
    </Link>
  );
}
