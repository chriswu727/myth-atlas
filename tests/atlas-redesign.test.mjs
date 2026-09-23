import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  comparisonIds,
  narrativeOptions,
  selectedMapEntry,
  readMapView,
} from "../src/lib/atlas-state.ts";
import { resolveReadingPath } from "../src/lib/reading.ts";

const root = new URL("../data/cosmogony/", import.meta.url);
const stories = readdirSync(root).map((file) =>
  JSON.parse(readFileSync(new URL(file, root))),
);
const options = narrativeOptions(
  stories.map((s) => ({
    id: s.tradition,
    name: s.tradition,
    branches: s.branches?.map((b) => ({ ...b, label: b.label.en })),
  })),
);

test("legacy comparison links resolve to independent accounts and deduplicate", () => {
  assert.deepEqual(
    comparisonIds(
      "greek,greek:succession,native-american:dine,polynesian,unknown",
      options,
    ),
    ["greek:succession", "native-american:dine", "polynesian:maori"],
  );
  assert.deepEqual(comparisonIds("unknown", options), []);
  assert.deepEqual(comparisonIds("", options, ["norse", "chinese"]), []);
  assert.equal(comparisonIds(null, options, ["norse", "chinese"]).length, 2);
});

test("different accounts of one collection can be compared without merging", () => {
  assert.deepEqual(
    comparisonIds("native-american:lakota,native-american:dine", options),
    ["native-american:lakota", "native-american:dine"],
  );
});

test("North American traditions have disjoint and exhaustive reading paths", () => {
  const story = stories.find((s) => s.tradition === "native-american");
  const groups = story.branches.map((b) =>
    resolveReadingPath(story.stages, story.branches, b.id, null).stages.map(
      (s) => s.id,
    ),
  );
  assert.deepEqual(groups, [
    ["stage-1", "stage-2", "stage-3"],
    ["stage-4", "stage-5"],
    ["stage-6", "stage-7", "stage-8"],
  ]);
  assert.equal(new Set(groups.flat()).size, story.stages.length);
});

test("old deep links to newly branched scenes still reach the requested scene", () => {
  const story = stories.find((s) => s.tradition === "native-american");
  const path = resolveReadingPath(
    story.stages,
    story.branches,
    null,
    "stage-6",
  );
  assert.equal(path.branchId, "dine");
  assert.equal(path.stages[path.activeIndex].id, "stage-6");
});

test("Polynesian track explicitly identifies its Maori selection and preserves all scenes", () => {
  const story = stories.find((s) => s.tradition === "polynesian");
  assert.match(story.branches[0].label.en, /Māori/);
  assert.deepEqual(
    resolveReadingPath(story.stages, story.branches, "maori", null).stages,
    story.stages,
  );
});

test("every branch references existing scenes and keeps bilingual scope notes", () => {
  for (const story of stories)
    for (const branch of story.branches ?? []) {
      assert.ok(
        branch.label.zh &&
          branch.label.en &&
          branch.description.zh &&
          branch.description.en,
      );
      assert.equal(new Set(branch.stageIds).size, branch.stageIds.length);
      for (const id of branch.stageIds)
        assert.ok(story.stages.some((s) => s.id === id));
    }
});

test("a stale pin cannot show another tradition's story in the selected panel", () => {
  const pins = [{ id: "odin", traditionId: "norse" }];
  assert.equal(selectedMapEntry("odin", [], pins, "greek"), undefined);
  assert.equal(selectedMapEntry("odin", [], pins, "norse")?.id, "odin");
});

test("shared viewports restore finite clamped coordinates without forced zoom", () => {
  assert.deepEqual(
    readMapView(new URLSearchParams("z=3.5&x=-400&y=-220"), 960, 540),
    { k: 3.5, x: -400, y: -220 },
  );
  assert.deepEqual(
    readMapView(new URLSearchParams("z=Infinity&x=NaN&y=99"), 960, 540),
    { k: 1, x: 0, y: 0 },
  );
  assert.deepEqual(
    readMapView(new URLSearchParams("z=20&x=-999999&y=-999999"), 960, 540),
    { k: 9, x: -7680, y: -4320 },
  );
});
