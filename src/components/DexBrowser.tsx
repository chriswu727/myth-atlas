"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createEntrySearch, rankedEntries } from "@/lib/search";
import EntryCard from "@/components/EntryCard";
import { dict, eraLabels, typeLabels } from "@/lib/i18n";
import {
  ENTRY_TYPES,
  ERAS,
  type EntryCardData,
  type EntryType,
  type Era,
  type Locale,
} from "@/lib/types";

export interface DexTradition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  count: number;
}

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
  const q = sp.get("q") ?? "";
  const tid = sp.get("t") ?? "";
  const type = (sp.get("ty") ?? "") as EntryType | "";
  const era = (sp.get("e") ?? "") as Era | "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredQ = useDeferredValue(q);
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }
  const mini = useMemo(() => createEntrySearch(entries), [entries]);
  const visible = useMemo(
    () =>
      rankedEntries(entries, mini, deferredQ).filter(
        (entry) =>
          (!tid || entry.tradition === tid) &&
          (!type || entry.type === type) &&
          (!era || entry.era === era),
      ),
    [entries, mini, deferredQ, tid, type, era],
  );

  const traditionById = useMemo(
    () => new Map(traditions.map((t) => [t.id, t])),
    [traditions],
  );
  const hasFilter = Boolean(q || tid || type || era);
  const activeFilterCount = [tid, type, era].filter(Boolean).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="dex-search-field">
          <label htmlFor="dex-search" className="eyebrow block">
            {locale === "zh" ? "搜索条目" : "Search the collection"}
          </label>
          <input
            id="dex-search"
            type="search"
            name="q"
            value={q}
            onChange={(event) => updateFilter("q", event.target.value)}
            placeholder={dict.dex.search[locale]}
            className="mt-3 w-full border-b border-[var(--line-strong)] bg-transparent py-2 text-base placeholder:text-vellum-faint focus:border-brass focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="filter-drawer-toggle"
          aria-expanded={filtersOpen}
          aria-controls="dex-filter-panel"
          onClick={() => setFiltersOpen((current) => !current)}
        >
          <span>{locale === "zh" ? "筛选条目" : "Filter records"}</span>
          <span>
            {activeFilterCount > 0
              ? locale === "zh"
                ? `${activeFilterCount} 项已启用`
                : `${activeFilterCount} active`
              : locale === "zh"
                ? "启封"
                : "Open"}
            <i aria-hidden="true">{filtersOpen ? "−" : "+"}</i>
          </span>
        </button>

        <aside
          id="dex-filter-panel"
          className={`filter-panel ${filtersOpen ? "is-mobile-open" : ""}`}
        >
          <div className="mt-8">
            <label htmlFor="tradition-filter" className="catalog-no block">
              {dict.dex.tradition[locale]}
            </label>
            <select
              id="tradition-filter"
              name="tradition"
              value={tid}
              onChange={(event) => updateFilter("t", event.target.value)}
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
              <button
                type="button"
                className="filter-chip"
                data-active={type === ""}
                onClick={() => updateFilter("ty", "")}
              >
                {dict.dex.all[locale]}
              </button>
              {ENTRY_TYPES.map((ty) => (
                <button
                  key={ty}
                  type="button"
                  className="filter-chip"
                  data-active={type === ty}
                  onClick={() => updateFilter("ty", ty)}
                >
                  {typeLabels[ty][locale]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="catalog-no">{dict.dex.era[locale]}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="filter-chip"
                data-active={era === ""}
                onClick={() => updateFilter("e", "")}
              >
                {dict.dex.all[locale]}
              </button>
              {ERAS.map((er) => (
                <button
                  key={er}
                  type="button"
                  className="filter-chip"
                  data-active={era === er}
                  onClick={() => updateFilter("e", er)}
                >
                  {eraLabels[er][locale]}
                </button>
              ))}
            </div>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                window.history.replaceState(null, "", window.location.pathname);
              }}
              className="button-secondary mt-8 w-full"
            >
              {dict.dex.clear[locale]}
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="button-primary mt-4 w-full lg:hidden"
          >
            {locale === "zh"
              ? `查看 ${visible.length} 则异闻`
              : `View ${visible.length} records`}
          </button>
        </aside>
      </div>

      <section>
        <div className="flex items-end justify-between border-t border-[var(--line-strong)] pt-2">
          <p className="catalog-no">
            {locale === "zh" ? "检索结果" : "Results"}
          </p>
          <p className="font-[family-name:var(--font-display-stack)] text-3xl">
            {visible.length}{" "}
            <span className="catalog-no">{dict.dex.results[locale]}</span>
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
                  returnTo={`/${locale}/dex${sp.size ? `?${sp}` : ""}`}
                  key={entry.id}
                  entry={entry}
                  tradition={{
                    shortName: tradition?.shortName ?? entry.tradition,
                    color: tradition?.color ?? "#9f3428",
                  }}
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
