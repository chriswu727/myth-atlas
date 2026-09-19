import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { comparisonSelection, sharedTags } from "../src/lib/comparison.ts";

const topic = JSON.parse(
  readFileSync(new URL("../data/comparisons/flood.json", import.meta.url)),
);
const root = new URL("../data/entries/", import.meta.url);
const entries = new Set(
  readdirSync(root).flatMap((dir) =>
    readdirSync(new URL(dir + "/", root))
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.slice(0, -5)),
  ),
);

test("every comparison event has a unique stable ID, a valid source and bilingual evidence", () => {
  const ids = new Set();
  const directory = new URL("../data/comparisons/", import.meta.url);
  for (const file of readdirSync(directory).filter((file) =>
    file.endsWith(".json"),
  )) {
    const comparison = JSON.parse(readFileSync(new URL(file, directory)));
    for (const source of comparison.sources)
      assert.equal(new URL(source.url).protocol, "https:");
    for (const story of comparison.stories) {
      assert.ok(story.entries.every((id) => entries.has(id)));
      assert.deepEqual(
        story.events.map((event) => event.step).sort(),
        comparison.steps.map((step) => step.id).sort(),
      );
      for (const event of story.events) {
        assert.ok(!ids.has(event.id), event.id);
        ids.add(event.id);
        assert.ok(
          comparison.sources.some((source) => source.id === event.source),
        );
        assert.ok(
          event.tags.every((tag) =>
            comparison.tags.some((item) => item.id === tag),
          ),
        );
        for (const field of ["title", "text", "locator"]) {
          assert.ok(event[field].zh.trim());
          assert.ok(event[field].en.trim());
        }
        if (event.status === "not-stated") assert.equal(event.tags.length, 0);
      }
    }
  }
});

test("untrusted URL selections cannot create duplicate, missing or singleton columns", () => {
  assert.deepEqual(comparisonSelection(topic, "noah,noah,yu,unknown"), [
    "noah",
    "yu",
  ]);
  assert.equal(comparisonSelection(topic, "unknown").length, 4);
  assert.equal(comparisonSelection(topic, "noah").length, 4);
});

test("shared detail highlights follow the selected stories and the current stage", () => {
  const boatStories = topic.stories.filter((story) =>
    ["utnapishtim", "noah"].includes(story.id),
  );
  assert.ok(sharedTags(boatStories, "recede").has("birds"));
  const noahAndYu = topic.stories.filter((story) =>
    ["noah", "yu"].includes(story.id),
  );
  assert.ok(!sharedTags(noahAndYu, "refuge").has("vessel"));
  assert.ok(sharedTags(noahAndYu, "renewal").has("people"));
});

test("comparison alignment leaves Yu's opening disaster and unstated cause intact", () => {
  const story = topic.stories.find((story) => story.id === "yu");
  const narrated = story.events.filter((event) => event.status === "attested");
  assert.equal(narrated[0].step, "deluge");
  assert.equal(
    story.events.find((event) => event.step === "cause").status,
    "not-stated",
  );
  assert.ok(!story.events.some((event) => event.tags.includes("vessel")));
});

test("sunken-world comparison preserves Atlantis’s unstated survival and shares only the sinking motif", () => {
  const sunken = JSON.parse(
    readFileSync(
      new URL("../data/comparisons/sunken-worlds.json", import.meta.url),
    ),
  );
  const atlantis = sunken.stories.find((story) => story.id === "atlantis");
  assert.equal(
    atlantis.events.find((event) => event.step === "survival").status,
    "not-stated",
  );
  assert.deepEqual([...sharedTags(sunken.stories, "loss")], ["engulfed"]);
  assert.equal(sharedTags(sunken.stories, "after").size, 0);
});
