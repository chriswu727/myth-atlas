"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MiniSearch from "minisearch";
import EntryCard from "@/components/EntryCard";
import { dict, eraLabels, typeLabels } from "@/lib/i18n";
import { ENTRY_TYPES, ERAS, type EntryCardData, type EntryType, type Era, type Locale } from "@/lib/types";

export interface DexTradition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  count: number;
}

/* CJK-aware tokenizer: latin words as-is; han/kana runs as single chars plus
   bigrams, so 九尾 finds 九尾狐 without 九 alone dragging in every entry. */
function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const m of text.toLowerCase().matchAll(/[a-z0-9]+|[一-鿿぀-ヿ]+/g)) {
    const tok = m[0];
    if (/^[a-z0-9]/.test(tok)) {
      out.push(tok);
    } else {
      for (let i = 0; i < tok.length; i++) {
        out.push(tok[i]);
        if (i < tok.length - 1) out.push(tok.slice(i, i + 2));
      }
    }
  }
  return out;
}

const isLatin = (term: string) => /^[a-z0-9]/.test(term);

export default function DexBrowser({
  entries,
  traditions,
  locale,
}: {
  entries: EntryCardData[];
  traditions: DexTradition[];
  locale: Locale;
}) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [tid, setTid] = useState(sp.get("t") ?? "");
  const [type, setType] = useState<EntryType | "">((sp.get("ty") as EntryType) ?? "");
  const [era, setEra] = useState<Era | "">((sp.get("e") as Era) ?? "");

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (tid) p.set("t", tid);
    if (type) p.set("ty", type);
    if (era) p.set("e", era);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, tid, type, era]);

  const mini = useMemo(() => {
    type Doc = EntryCardData & { domainsText: string };
    const ms = new MiniSearch<Doc>({
      fields: ["nameZh", "nameEn", "original", "title", "summary", "domainsText", "volume"],
      storeFields: [],
      tokenize,
      searchOptions: {
        tokenize,
        combineWith: 'AND',
        prefix: (term) => isLatin(term),
        fuzzy: (term) => (isLatin(term) && term.length >= 4 ? 0.15 : false),
        boost: { nameZh: 3, nameEn: 3, original: 2, title: 1.5 },
      },
    });
    ms.addAll(entries.map((e) => ({ ...e, domainsText: e.domains.join(" ") })));
    return ms;
  }, [entries]);

  const matchIds = useMemo(() => {
    if (!q.trim()) return null;
    return new Set(mini.search(q).map((r) => r.id as string));
  }, [q, mini]);

  const visible = entries.filter(
    (e) =>
      (!matchIds || matchIds.has(e.id)) &&
      (!tid || e.tradition === tid) &&
      (!type || e.type === type) &&
      (!era || e.era === era)
  );

  const traditionById = useMemo(() => new Map(traditions.map((t) => [t.id, t])), [traditions]);
  const hasFilter = q || tid || type || era;

  const chip = (active: boolean) =>
    `border px-3 py-1 text-xs tracking-wide transition-colors cursor-pointer ${
      active
        ? "border-brass text-brass"
        : "border-[var(--brass-faint)] text-vellum-dim hover:border-[var(--brass-soft)] hover:text-vellum"
    }`;

  return (
    <div>
      <div className="flex flex-col gap-4">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.dex.search[locale]}
          className="w-full border hairline bg-ink-well px-4 py-2.5 text-base placeholder:text-vellum-faint focus:border-brass focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="catalog-no mr-1 min-w-10">{dict.dex.tradition[locale]}</span>
          <select
            name="tradition"
            value={tid}
            onChange={(e) => setTid(e.target.value)}
            className="border hairline bg-ink-well px-2 py-1 text-sm text-vellum focus:border-brass focus:outline-none"
          >
            <option value="">{dict.dex.all[locale]}</option>
            {traditions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="catalog-no mr-1 min-w-10">{dict.dex.type[locale]}</span>
          <button type="button" className={chip(type === "")} onClick={() => setType("")}>
            {dict.dex.all[locale]}
          </button>
          {ENTRY_TYPES.map((ty) => (
            <button key={ty} type="button" className={chip(type === ty)} onClick={() => setType(ty)}>
              {typeLabels[ty][locale]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="catalog-no mr-1 min-w-10">{dict.dex.era[locale]}</span>
          <button type="button" className={chip(era === "")} onClick={() => setEra("")}>
            {dict.dex.all[locale]}
          </button>
          {ERAS.map((er) => (
            <button key={er} type="button" className={chip(era === er)} onClick={() => setEra(er)}>
              {eraLabels[er][locale]}
            </button>
          ))}
        </div>
      </div>

      <p className="catalog-no mt-6 border-b hairline pb-2">
        {visible.length} {dict.dex.results[locale]}
      </p>

      {visible.length === 0 ? (
        <div className="py-20 text-center text-vellum-dim">
          <p>{dict.dex.empty[locale]}</p>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTid("");
                setType("");
                setEra("");
              }}
              className="mt-4 border border-[var(--brass-soft)] px-4 py-1.5 text-sm text-brass hover:border-brass"
            >
              {dict.dex.clear[locale]}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((e) => {
            const t = traditionById.get(e.tradition);
            return (
              <EntryCard
                key={e.id}
                entry={e}
                tradition={{ shortName: t?.shortName ?? e.tradition, color: t?.color ?? "#c3a55e" }}
                locale={locale}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
