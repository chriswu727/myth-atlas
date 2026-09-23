# Atlas and narrative timelines — implementation notes

## Scope

- Map selection preserves the viewport unless the selected location is off screen; focus and world-view controls are separate from closing details.
- Hover no longer changes the selected tradition's story pins. Stale cross-tradition pin URLs cannot populate the wrong panel.
- Quiet map markers, collision-filtered labels, collection layers, overview panels and a three-account comparison tray replace the previous presentation.
- Comparisons follow independent narrative branches, support complete sequences and motif-focused views, and retain map return context.
- Native American source material is split into Haudenosaunee, Lakota and Diné branches. The Polynesian sequence is explicitly labelled Māori. Existing prose and source notes remain intact.
- Navigation prioritizes atlas, timelines and collection; collection search stays visible. Mobile comparison pages can focus one motif/stage at a time.

## URL compatibility

Map: `realm`, `pin`, `z`, `x`, `y` remain supported; `layer` and `compare` are additive.
Comparison IDs use `tradition:branch` where branches exist. Old tradition-only IDs resolve to that collection's first account. Duplicate/unknown IDs are removed; at most three accounts are accepted. An explicitly empty selection remains empty.
Old `stage-N` links to the newly branched North American material resolve to the branch containing the requested stage when no branch is supplied. Explicit stale branch selections retain the previous fallback behavior.

## First-pass validation — Windows, 2026-09-23

Complete clone based on main at `00a76c914dbbaa5d84258d873d604c1d9cb49653`, including public assets. Dependencies installed successfully with `npm ci`; Node 24.19.0, Next 16.2.10.

- Validation: 500 entries, 0 errors, 0 warnings.
- Content audit: 608 attributed images; 0 missing/orphan/duplicate image groups and 0 dangling references. The existing 47 single-source entries still need editorial work.
- Tests: 24 passed, including eight new tests for account isolation, legacy URLs, stale pins and bounded viewports.
- ESLint: passed.
- Production build: passed, including TypeScript and all 1,082 generated pages.
- `git diff --check`: passed.

## Browser checks completed

- Both language versions render; switching language preserves comparison IDs, motif and localized map return context.
- All 24 cultural tradition markers select the correct account in a 390 px viewport. All six collection-layer markers were checked separately. Keyboard Enter selects markers; moving keyboard focus to another marker leaves the selected panel unchanged.
- Initial selection keeps global zoom. Explicit focus zooms to 2.2; switching tradition retains zoom. World reset retains selection; closing details restores focus to the tradition selector.
- Mobile panels remain reachable after selection and expand/collapse. Escape closes the navigation menu and restores focus to its toggle.
- Map → comparison → map retains the current tradition, viewport and all three selected accounts, including accounts added on the comparison page.
- Independent Haudenosaunee, Diné and Māori tracks show only their own ordered scenes. Add, replace and remove work; the fourth selection is unavailable. Empty selections survive refresh.
- Motif view hides unrelated nodes, including in English. Full mobile expansion exposes each account's complete sequence.
- Map and comparison document widths do not overflow at 375, 390, 430, 768, 1280 and 1440 px. Desktop and mobile screenshots were captured.
- Collection search is visible on mobile; searching 九尾 returns seven matching entries.
- No browser warnings or errors were recorded during the tested map/comparison flows.

## Remaining device/manual coverage

Actual touchscreen one-finger scrolling and two-finger map gestures still need device testing; responsive browser dimensions do not verify touch hardware. Reduced-motion behavior and map-load failure/retry are implemented but were not simulated in the browser. These checks are not represented as completed.

## Second pass — mobile mode and Roman material

- Mobile defaults to motif mode with the matching button selected. Explicit full-narrative mode shows every node on all viewport sizes. Mode is retained in the URL after interaction, including refresh and language changes; the separate hidden mobile filter has been removed.
- Map and comparison have clear-all controls. Clearing the map tray preserves the selected tradition and viewport; browser Back restores the previous accounts. Empty comparison guidance now asks for two accounts when none are selected.
- Added the Roman map entry, two bilingual articles and two separately selectable Ovid accounts (four Metamorphoses scenes, three Fasti scenes). Primary-text ranges, material evidence, geographic meaning and remaining coverage are documented in `MYTH_COVERAGE.md`.
- The preview uses the actual number of featured articles, including collections with fewer than three.
- Search regression checks compare empty-search results against the complete current catalog, replacing the old hardcoded count of 500.
- Validation: 502 entries, 0 errors/warnings; 25 tests passed; ESLint and standalone TypeScript passed. Content audit: 0 missing files/dangling references/editorial flags. Two new entries intentionally have no image; the existing 47 single-source entries remain.
- Browser: all 25 cultural markers select correctly at 390 px. Roman previews and article/source links work; mobile full mode exposes seven scenes, persists after refresh and English switching, and clear-all/Back restores the two accounts.
- The new local production build could not fetch the four existing Google Fonts under this turn's restricted network. This is separate from the first-pass production build above. Current browser checks use the functioning development preview with previously cached fonts; they are not a substitute for a new production build.

## Deferred content work

Roman coverage now has a deliberately limited, sourced first batch. Baltic, Turkic, Dogon, Yanomami and specific Tierra del Fuego traditions remain research candidates, with source leads and classification caveats in `MYTH_COVERAGE.md`. No empty map markers were added for those candidates.
