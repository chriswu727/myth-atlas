"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
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
  const deferredQ = useDeferredValue(q);

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
    if (!deferredQ.trim()) return null;
    return new Set(mini.search(deferredQ).map((r) => r.id as string));
  }, [deferredQ, mini]);

  const visible = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (!matchIds || matchIds.has(entry.id)) &&
          (!tid || entry.tradition === tid) &&
          (!type || entry.type === type) &&
          (!era || entry.era === era)
      ),
    [entries, matchIds, tid, type, era]
  );

  const traditionById = useMemo(() => new Map(traditions.map((t) => [t.id, t])), [traditions]);
  const hasFilter = Boolean(q || tid || type || era);

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
      <aside className="filter-panel lg:sticky lg:top-28 lg:self-start">
        <label htmlFor="dex-search" className="eyebrow block">
          {locale === "zh" ? "叩问万象" : "Invoke the codex"}
        </label>
        <input
          id="dex-search"
          type="search"
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={dict.dex.search[locale]}
          className="mt-3 w-full border-b border-[var(--line-strong)] bg-transparent py-2 text-base placeholder:text-vellum-faint focus:border-brass focus:outline-none"
        />

        <div className="mt-8">
          <label htmlFor="tradition-filter" className="catalog-no block">{dict.dex.tradition[locale]}</label>
          <select
            id="tradition-filter"
            name="tradition"
            value={tid}
            onChange={(event) => setTid(event.target.value)}
            className="mt-2 w-full border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-vellum focus:border-brass focus:outline-none"
          >
            <option value="">{dict.dex.all[locale]}</option>
            {traditions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-7">
          <p className="catalog-no">{dict.dex.type[locale]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="filter-chip" data-active={type === ""} onClick={() => setType("")}>
            {dict.dex.all[locale]}
          </button>
          {ENTRY_TYPES.map((ty) => (
            <button key={ty} type="button" className="filter-chip" data-active={type === ty} onClick={() => setType(ty)}>
              {typeLabels[ty][locale]}
            </button>
          ))}
          </div>
        </div>

        <div className="mt-7">
          <p className="catalog-no">{dict.dex.era[locale]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="filter-chip" data-active={era === ""} onClick={() => setEra("")}>
            {dict.dex.all[locale]}
          </button>
          {ERAS.map((er) => (
            <button key={er} type="button" className="filter-chip" data-active={era === er} onClick={() => setEra(er)}>
              {eraLabels[er][locale]}
            </button>
          ))}
          </div>
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTid("");
              setType("");
              setEra("");
            }}
            className="button-secondary mt-8 w-full"
          >
            {dict.dex.clear[locale]}
          </button>
        )}
      </aside>

      <section>
        <div className="flex items-end justify-between border-t border-[var(--line-strong)] pt-2">
          <p className="catalog-no">{locale === "zh" ? "卷中所见" : "Revealed in the leaves"}</p>
          <p className="font-[family-name:var(--font-display-stack)] text-3xl">
            {visible.length} <span className="catalog-no">{dict.dex.results[locale]}</span>
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="paper-panel mt-8 py-20 text-center text-vellum-dim">
            <p>{dict.dex.empty[locale]}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-6">
          {visible.map((entry, index) => {
            const tradition = traditionById.get(entry.tradition);
            return (
              <EntryCard
                key={entry.id}
                entry={entry}
                tradition={{ shortName: tradition?.shortName ?? entry.tradition, color: tradition?.color ?? "#9f3428" }}
                locale={locale}
                eager={index < 4}
              />
            );
          })}
          </div>
        )}
      </section>
    </div>
  );
}
