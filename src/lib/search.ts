import MiniSearch from "minisearch";
import type { EntryCardData } from "./types";

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  for (const match of text.toLowerCase().matchAll(/[\p{L}\p{N}]+/gu)) {
    for (const part of match[0].matchAll(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+|[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu,
    )) {
      const word = part[0];
      if (
        /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word)
      ) {
        for (let i = 0; i < word.length; i++) {
          tokens.push(word[i]);
          if (i + 1 < word.length) tokens.push(word.slice(i, i + 2));
        }
      } else tokens.push(word);
    }
  }
  return tokens;
}

export function createEntrySearch(entries: EntryCardData[]) {
  const isLatin = (term: string) => /^[a-z0-9]/.test(term);
  const index = new MiniSearch({
    fields: [
      "nameZh",
      "nameEn",
      "original",
      "title",
      "summary",
      "domainsText",
      "volume",
    ],
    tokenize,
    searchOptions: {
      tokenize,
      combineWith: "AND",
      prefix: isLatin,
      fuzzy: (term) => (isLatin(term) && term.length >= 4 ? 0.15 : false),
      boost: { nameZh: 5, nameEn: 5, original: 4, title: 1.5 },
    },
  });
  index.addAll(
    entries.map((entry) => ({
      ...entry,
      domainsText: entry.domains.join(" "),
    })),
  );
  return index;
}

export function rankedEntries(
  entries: EntryCardData[],
  index: MiniSearch,
  query: string,
) {
  if (!query.trim()) return entries;
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  return index.search(query).flatMap(({ id }) => {
    const entry = byId.get(id);
    return entry ? [entry] : [];
  });
}
