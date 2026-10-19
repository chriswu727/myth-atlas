# Myth Atlas

A bilingual mythology atlas for exploring myths, bestiaries, urban legends, and lost lands through an interactive world map and a searchable catalog.

[Explore the English site](https://myth-atlas.vercel.app/en) · [Project story](https://yichenwu.dev/projects/myth-atlas)

This is an ongoing experiment in building a complete website with AI assistance across implementation, content collection, and selected editorial illustrations. Entries include source references and image provenance. AI-assisted narratives require source review, and generated illustrations are interpretations rather than historical evidence.

## Development

Use Node.js 22.18 or newer for the test runner.

```bash
npm install
npm run dev
npm run build && npm start
npm run validate
npm run audit
npm run lint
npm test
```

`validate` checks entry data. `audit` checks content and image consistency. The tests cover search, navigation context, and narrative branches. Use a production build when checking interactions on Node.js 25; the project has previously encountered development-mode hydration problems in that environment.

## Content structure

Each entry is a JSON file under `data/entries/<tradition>/`. Register traditions in `data/traditions.json`; the site generates the corresponding pages, map, filters, and search data from these files.

The entry schema and editorial contract are documented in [the content guide](docs/CONTENT_GUIDE.md). Run `npm run validate` after changing entries. The [project overview](docs/PROJECT.md) describes the architecture and content workflow.

## Images and provenance

The collection combines sourced artwork with clearly identified original editorial illustrations. Image records retain the source, artist, and license or generation provenance; the entry pages display those details.

The Wikimedia Commons image pipeline supports search, inspection, and import:

```bash
node scripts/fetch-image.mjs search "Zeus bust"
node scripts/fetch-image.mjs info "File:Example.jpg"
node scripts/fetch-image.mjs fetch "File:Example.jpg" --entry zeus
```

Use `scripts/register-image.mjs` to register original editorial illustrations with their provenance. A consistent data record or a passing validation check does not establish the historical accuracy of a narrative or image attribution.
