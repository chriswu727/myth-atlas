# Content schema and editorial guide

This guide describes the contract for Myth Atlas records. Keep it aligned with [the TypeScript types](../src/lib/types.ts) and [the validator](../scripts/validate.mjs).

The website publishes English and Chinese content. This guide is written in English; the `zh` fields contain Chinese product content.

## Data layout

```text
data/
  traditions.json                  Registered traditions and collections
  intros/<tradition>.json           Introductions with zh and en fields
  entries/<tradition>/<id>.json     One record per file
```

Register new traditions before adding records. Pages, map data, filters, and search data are generated from the collection. A filename must match the record's `id`.

For a populated example, see [the Zeus record](../data/entries/greek/zeus.json). Examples are content records, not templates to copy without source review.

## Entry fields

| Field | Requirement | Contract |
| :--- | :--- | :--- |
| `id` | Required | Globally unique, lowercase kebab-case. Use a disambiguating suffix when necessary. |
| `tradition` | Required | An ID registered in `data/traditions.json`. |
| `type` | Required | `deity`, `creature`, `hero`, `spirit`, `place`, `artifact`, or `tale`. |
| `era` | Required | `ancient`, `folk`, `modern`, or `contemporary`. |
| `name` | Required | `zh` and `en`; optional `original`. If `original` is present, include `originalLang`, using the collection's Chinese language-name convention. |
| `title` | Required | A brief bilingual title or identity. |
| `summary` | Required | At most 80 Chinese characters and 40 English words. Used in cards and search results. |
| `description` | Required | At least 180 Chinese characters and 100 English words, usually in 2–4 paragraphs separated by blank lines. |
| `domains` | Required | Matching `zh` and `en` arrays containing 2–5 tags. |
| `traits` | Optional | Usually 2–4 quick facts, each with a bilingual `label` and `value`. |
| `related` | Optional | Related record IDs. Unresolved IDs are warnings and are skipped by the renderer. |
| `sources` | Required | At least one real reference, with `zh` and `en` labels and an optional HTTPS `url`. |
| `rights` | Optional | Source-content rights metadata: `name`, HTTPS `url`, and a bilingual `note`. |
| `geo` | Where applicable | Latitude, longitude, and an optional bilingual place label. Use a documented associated place, not an invented coordinate. |
| `volume` | Conditional | A bilingual volume label; required for Shanhaijing entries. |
| `image` | Artwork workflow | Start with `null`; use the image pipeline to populate source and attribution metadata. |
| `coverImage` | Optional | A separate editorial cover image with its title, artist, license, and dimensions. |

Latitude must be within `[-90, 90]` and longitude within `[-180, 180]`. Add coordinates where an urban legend, lost land, or sacred location has a meaningful geographic association; broad mythological figures may remain unlocated.

## Writing in two languages

Write natural prose in each language rather than literal sentence-by-sentence translations. Keep the facts consistent. Use established names and include original-language forms where they help identify a subject.

A description generally covers:

1. **Identity and appearance:** concrete features, role, setting, and place in the tradition.
2. **Account and source:** a central narrative or an early attestation, with enough detail to understand the story.
3. **Later interpretation, where relevant:** how the subject changed in subsequent texts or cultural settings.

## Editorial style

The product uses an illustrated-catalog style: concise, vivid, and specific. Titles and summaries can invite curiosity, while descriptions should anchor their imagery in the source material.

- Prefer concrete actions, objects, colors, places, and dates to strings of adjectives.
- Do not invent thoughts, prophecies, symbolic meanings, or narrative details for atmosphere.
- Distinguish the source account from later interpretations.
- Avoid formulaic contrasts, vague claims about humanity, and lyrical concluding summaries.
- Do not use emoji or decorative Unicode symbols in editorial prose.

## Sources and cultural context

Every record needs a real source. Never invent references, dates, or details to satisfy the schema.

- Describe living religious traditions respectfully and without sensationalism or judgments about belief.
- Identify the creator and date of modern fictional characters where known. Use original descriptions rather than copying the creator's prose.
- For urban legends, distinguish the story from documented facts about its circulation, including the earliest known channel or publication where available.
- Preserve differences between accounts. Do not combine incompatible versions into an apparently canonical narrative.
- Omit uncertain assertions or clearly qualify them. A source-review pass remains necessary even when automated validation succeeds.

## Artwork

Use `scripts/fetch-image.mjs` for sourced artwork and `scripts/register-image.mjs` for original editorial illustrations. Do not manually invent attribution metadata.

An `image` record includes `file`, `sourceUrl`, and `license`; it may also include `artist`, `sourceTitle`, `width`, and `height`. A `coverImage` retains its editorial title, artist, and license separately.

Inspect every imported image visually. Verify its subject and provenance, and distinguish historical or archival material from contemporary interpretation. Use contextual imagery when a direct depiction would be misleading or unsuitable. Formal entries should not remain without artwork simply because a first search failed.

## Validation

```bash
node scripts/validate.mjs
node scripts/validate.mjs --tradition greek
npm run audit
```

Resolve all validation errors before publishing. Review warnings such as unresolved related-record references. After a schema change, update the types, validator, and this guide together.

Passing validation confirms structural consistency, not historical accuracy or permission to reuse source material.
