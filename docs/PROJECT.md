# Project architecture and workflows

Myth Atlas is an English–Chinese collection of mythology, bestiaries, urban legends, and lost lands. Readers can explore an interactive map, search records, follow reading trails, and compare specific narratives.

[Live website](https://myth-atlas.vercel.app/en) · [Repository overview](../README.md)

## Application

The site uses Next.js App Router and static generation, React, TypeScript, and Tailwind CSS. D3 and TopoJSON render the map; MiniSearch powers client-side search.

```text
data/
  traditions.json                  Tradition and collection registry
  intros/<tradition>.json           Bilingual introductions
  entries/<tradition>/<id>.json     Individual records
  cosmogony/<tradition>.json        Creation narratives and branches
src/
  app/                             Localized routes
  components/                      Map, catalog, and reading interfaces
  lib/                             Types, data access, search, and navigation
public/
  images/entries/                  Entry artwork
  map/                             World geometry copied during prebuild
scripts/                           Validation, audits, and image workflows
tests/                             Search and reading regression tests
```

## Content model

Adding a record means adding a JSON file under its registered tradition. Adding a tradition also requires an entry in `data/traditions.json`. Pages, map data, filters, and search data derive from these files.

The [content guide](CONTENT_GUIDE.md) defines the entry contract. Keep it consistent with `src/lib/types.ts` and `scripts/validate.mjs` when the schema changes.

- Record IDs are globally unique. `related` links are soft references: unresolved IDs produce warnings and are omitted when rendering.
- A tradition's `anchor` locates its map beacon. An entry's optional `geo` field locates an associated place; it does not establish that a legendary event happened there.
- Image metadata is populated through the import or registration scripts. Formal entries should have suitable artwork, with its origin accurately labeled.
- The content is bilingual data. Chinese content remains part of the product.

## Reading and navigation

Routes use `/en/` and `/zh/`. The root chooses a locale from the saved preference or browser language. UI labels live in `src/lib/i18n.ts`; record content carries both languages.

Map selections and zoom are encoded in the URL. Entry return links and locale switching preserve exploration context. On smaller screens, the map has a tradition selector and a separate story preview.

Creation narratives have stages aligned by a shared motif vocabulary:

```text
chaos → first-beings → separation → world-form → humans → ordeal → now
```

The order is defined in `src/lib/types.ts`. A motif change also requires updates to translated labels and validation. Branches represent different selected accounts or reading sequences; they are not historical dates.

An empty motif means the selected account does not include that stage. It is not evidence that an entire tradition lacks such a story. Do not invent material to fill a comparison cell.

## Search

MiniSearch indexes the catalog, including original-language names. CJK-aware tokenization uses individual characters and bigrams, while Latin text uses whole words. Queries combine terms with `AND`; fuzzy matching is limited to Latin words of at least four letters.

These choices reduce unrelated matches for short CJK queries. Preserve the ranking regression tests when changing tokenization or query behavior.

## AI-assisted content workflow

The initial collection was assembled in batches, with drafting and source-review passes followed by validation. New batches can follow the same process:

1. Define a collection's scope and source material.
2. Draft English and Chinese records with consistent facts.
3. Review sources, names, chronology, cultural context, and duplicate coverage.
4. Validate the records and resolve errors.
5. Import or register suitable artwork, then inspect it visually.
6. Check the resulting pages and run the content audit.

Schema validation detects structural problems. It does not establish the accuracy of a narrative, source citation, or image attribution.

## Images and provenance

The site combines archival and openly licensed artwork with original editorial illustrations. Each image record preserves its source, attribution, and license or generation provenance, which the entry page displays.

```bash
node scripts/fetch-image.mjs search "Zeus bust"
node scripts/fetch-image.mjs info "File:Example.jpg"
node scripts/fetch-image.mjs fetch "File:Example.jpg" --entry zeus
```

Use `scripts/register-image.mjs` for original editorial illustrations. Inspect images after import: a plausible filename is not enough to establish that the subject is correct.

Choose contextual artwork when a direct depiction would misidentify the subject, obscure cultural context, or reproduce a modern creator's protected character design. Label disputed identifications and contemporary interpretations clearly. A place entry should depict the place or its context, rather than silently substituting a creature associated with it.

## Visual system

The interface uses archival-paper colors, dark map surfaces, serif typography, catalog rules, and per-tradition accents:

- Paper: `#e6dcc5` and `#f2ead9`
- Ink: `#172022`
- Accent colors: `#9f3428` and `#243d54`
- Type: Cormorant, EB Garamond, Noto Serif SC, and IBM Plex Mono

Decorative icons use SVG. The design avoids presenting one culture's sacred imagery as a generic emblem for the entire collection.

## Development and verification

```bash
npm ci
npm run dev
npm run validate
npm run audit
npm run lint
npm test
npm run build
npm start
```

Use Node.js 22.18 or newer. On Node.js 25, use `build` and `start` to check interactions if development-mode hydration fails. Next.js route parameters are asynchronous and must be awaited.

The predev and prebuild scripts copy world geometry into `public/map/`. Image requests to Wikimedia Commons include a User-Agent. GitHub Actions runs validation, audit, lint, tests, and a production build.
