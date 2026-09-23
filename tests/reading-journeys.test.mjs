import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createEntrySearch, rankedEntries } from "../src/lib/search.ts";
import {
  atlasUrl,
  localizedUrl,
  safeReturnPath,
} from "../src/lib/navigation.ts";
import { resolveReadingPath } from "../src/lib/reading.ts";

const greek = JSON.parse(
  readFileSync(new URL("../data/cosmogony/greek.json", import.meta.url)),
);
const entriesRoot = new URL("../data/entries/", import.meta.url);
const records = readdirSync(entriesRoot).flatMap((tradition) =>
  readdirSync(new URL(`${tradition}/`, entriesRoot))
    .filter((name) => name.endsWith(".json"))
    .map((name) =>
      JSON.parse(readFileSync(new URL(`${tradition}/${name}`, entriesRoot))),
    ),
);
const entries = records.map((record) => ({
  ...record,
  nameZh: record.name.zh,
  nameEn: record.name.en,
  original: record.name.original,
  title: record.title.zh,
  summary: record.summary.zh,
  domains: record.domains.zh,
  volume: record.volume?.zh,
}));
const index = createEntrySearch(entries);

test("an exact name outranks mentions even when it comes later in the catalog", () => {
  const found = rankedEntries(entries, index, "Zeus");
  assert.equal(found[0].id, "zeus");
  assert.ok(found.length > 1);
});

test("Chinese multi-character searches do not match unrelated single characters", () => {
  const found = rankedEntries(entries, index, "九尾");
  assert.ok(found.some((entry) => entry.id === "jiu-wei-hu"));
  assert.ok(!found.some((entry) => entry.id === "behemoth"));
  for (const entry of found)
    assert.match(
      [entry.nameZh, entry.title, entry.summary, ...entry.domains].join(" "),
      /九尾/,
    );
});

test("original Korean and Greek names are searchable", () => {
  assert.ok(
    rankedEntries(entries, index, "구미호").some(
      (entry) => entry.id === "kumiho",
    ),
  );
  const zeus = entries.find((entry) => entry.id === "zeus");
  assert.ok(
    rankedEntries(entries, index, zeus.original).some(
      (entry) => entry.id === "zeus",
    ),
  );
});

test("empty searches retain the complete collection and do not mutate its order", () => {
  const before = entries.map((entry) => entry.id);
  assert.deepEqual(
    rankedEntries(entries, index, " ").map((entry) => entry.id),
    before,
  );
  rankedEntries(entries, index, "Zeus");
  assert.deepEqual(
    entries.map((entry) => entry.id),
    before,
  );
});

test("language changes retain filters and translate a nested return destination", () => {
  const query = new URLSearchParams({
    q: "九尾",
    t: "shanhaijing",
    returnTo: "/zh?realm=shanhaijing&z=2.2#atlas",
  });
  const url = new URL(
    localizedUrl("/zh/dex", query.toString(), "en", "#results"),
    "https://example.com",
  );
  assert.equal(url.pathname, "/en/dex");
  assert.equal(url.searchParams.get("q"), "九尾");
  assert.equal(url.searchParams.get("t"), "shanhaijing");
  assert.equal(
    url.searchParams.get("returnTo"),
    "/en?realm=shanhaijing&z=2.2#atlas",
  );
  assert.equal(url.hash, "#results");
});

test("map return links preserve selection and viewport", () => {
  const target = atlasUrl("zh", "shanhaijing", { k: 2.2, x: -340, y: -170 });
  assert.equal(safeReturnPath(target, "zh"), target);
  const url = new URL(target, "https://example.com");
  assert.equal(url.searchParams.get("realm"), "shanhaijing");
  assert.equal(url.searchParams.get("z"), "2.200");
  assert.equal(url.searchParams.get("x"), "-340.0");
  assert.equal(url.hash, "#atlas");
});

test("return destinations reject external, malformed and cross-locale paths", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/zh\\evil",
    "/zh/../../en",
    "/zh-other",
    "/en",
    "javascript:alert(1)",
  ])
    assert.equal(safeReturnPath(value, "zh"), null);
});

test("the succession reading does not jump into the egg or flood account", () => {
  const path = resolveReadingPath(
    greek.stages,
    greek.branches,
    "succession",
    null,
  );
  assert.deepEqual(
    path.stages.map((stage) => stage.id),
    ["chaos", "first-gods", "sky-and-earth", "titan-war", "divine-order"],
  );
});

test("independent one-scene accounts remain independently addressable", () => {
  for (const [branch, stage] of [
    ["orphic", "silver-egg"],
    ["flood", "flood"],
  ]) {
    const path = resolveReadingPath(
      greek.stages,
      greek.branches,
      branch,
      stage,
    );
    assert.equal(path.stages.length, 1);
    assert.equal(path.stages[path.activeIndex].id, stage);
  }
});

test("stale branch and stage URLs fall back to a valid reading position", () => {
  const path = resolveReadingPath(
    greek.stages,
    greek.branches,
    "missing",
    "silver-egg",
  );
  assert.equal(path.branchId, "succession");
  assert.equal(path.stages[path.activeIndex].id, "chaos");
});

test("every Greek scene is still available and alternative accounts keep their sources", () => {
  const covered = new Set(greek.branches.flatMap((branch) => branch.stageIds));
  assert.deepEqual(covered, new Set(greek.stages.map((stage) => stage.id)));
  for (const stage of greek.stages)
    assert.ok(stage.source.zh && stage.source.en);
  assert.ok(!greek.stages.some((stage) => stage.motif === "humans"));
});
