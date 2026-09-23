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

## Local validation — Windows, 2026-09-23

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

## Deferred content work

No new cultures or sources are invented by this UI change. Roman, Baltic, Turkic, Dogon, Yanomami and specific Tierra del Fuego traditions remain research candidates. Public source review and appropriate classification are required before adding those entries.
