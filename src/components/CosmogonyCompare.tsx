"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { MOTIFS, type Locale } from "@/lib/types";
import { motifLabels } from "@/lib/i18n";
import { comparisonIds, narrativeOptions } from "@/lib/atlas-state";
import { safeReturnPath } from "@/lib/navigation";
import { resolveReadingPath } from "@/lib/reading";
import type { InteractiveCosmogonyStory } from "./InteractiveCosmogonyTimeline";

const mobileQuery = "(max-width: 760px)";
function subscribeViewport(onChange: () => void) {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const serverSnapshot = () => false;

export default function CosmogonyCompare({
  stories,
  locale,
}: {
  stories: InteractiveCosmogonyStory[];
  locale: Locale;
}) {
  const zh = locale === "zh";
  const params = useSearchParams();
  const options = narrativeOptions(stories);
  const ids = comparisonIds(params.get("compare"), options, [
    "chinese",
    "norse",
  ]);
  const motif = MOTIFS.find((item) => item === params.get("motif")) ?? "chaos";
  const mobile = useSyncExternalStore(
    subscribeViewport,
    mobileSnapshot,
    serverSnapshot,
  );
  const view = params.get("view");
  const themes = view === "themes" || (view !== "story" && mobile);
  const returnUrl = new URL(
    safeReturnPath(params.get("returnTo"), locale) ?? `/${locale}#atlas`,
    "https://myth-atlas.invalid",
  );
  returnUrl.searchParams.set("compare", ids.join(","));
  const returnTo = `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`;
  const available = options.filter((option) => !ids.includes(option.id));
  function readerHref(storyId: string, stageId: string, branchId?: string) {
    const query = new URLSearchParams(params.toString());
    query.set("story", storyId);
    query.set("stage", stageId);
    if (branchId) query.set("branch", branchId);
    else query.delete("branch");
    return `/${locale}/cosmogony?${query}#reader`;
  }
  function update(values: Record<string, string>) {
    const url = new URL(window.location.href);
    // Persist the effective mode so refresh and locale changes keep the same view.
    url.searchParams.set("view", themes ? "themes" : "story");
    for (const [key, value] of Object.entries(values))
      url.searchParams.set(key, value);
    window.history.pushState(null, "", `${url.pathname}${url.search}#compare`);
  }
  return (
    <section
      id="compare"
      className="origin-compare narrative-workbench"
      aria-labelledby="compare-title"
    >
      <div className="journey-section-heading">
        <div>
          <p className="eyebrow">
            01 / {zh ? "并读世界的开端" : "PARALLEL BEGINNINGS"}
          </p>
          <h2 id="compare-title">
            {zh
              ? "每个世界，有自己的顺序。"
              : "Every world has its own sequence."}
          </h2>
        </div>
        <Link className="atlas-panel-link" href={returnTo}>
          {zh ? "← 返回世界地图" : "← Back to the atlas"}
        </Link>
      </div>
      <p className="compare-intro">
        {zh
          ? "沿各自的轨道读完整故事，或选一个母题寻找呼应。这里的先后是叙事顺序，不是历史年代；相似也不自动意味着传播。"
          : "Follow each account in its own order, or explore a shared motif. These are narrative sequences, not historical dates; similarity does not establish transmission."}
      </p>
      <div className="timeline-controls">
        <div
          className="timeline-mode"
          aria-label={zh ? "阅读方式" : "Reading mode"}
        >
          <button
            aria-pressed={!themes}
            onClick={() => update({ view: "story" })}
          >
            {zh ? "完整叙事" : "Full narratives"}
          </button>
          <button
            aria-pressed={themes}
            onClick={() => update({ view: "themes" })}
          >
            {zh ? "主题对照" : "By motif"}
          </button>
        </div>
        {ids.length < 3 && available.length > 0 && (
          <label className="timeline-add">
            {zh ? "添加叙事" : "Add an account"}
            <select
              value=""
              onChange={(event) => {
                if (event.target.value)
                  update({ compare: [...ids, event.target.value].join(",") });
              }}
            >
              <option value="">
                {zh ? "选择具体传统与版本…" : "Choose a tradition and account…"}
              </option>
              {available.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {ids.length > 0 && (
          <button
            className="timeline-clear"
            onClick={() => update({ compare: "" })}
          >
            {zh ? "清空对比" : "Clear comparison"}
          </button>
        )}
      </div>
      <div
        className="motif-choices"
        aria-label={
          themes
            ? zh
              ? "选择母题"
              : "Choose a motif"
            : zh
              ? "突出显示母题"
              : "Highlight a motif"
        }
      >
        {MOTIFS.map((option) => (
          <button
            key={option}
            aria-pressed={motif === option}
            onClick={() => update({ motif: option })}
          >
            {motifLabels[option][locale]}
          </button>
        ))}
      </div>
      <div className="timeline-mobile-controls">
        <button
          onClick={() =>
            update({
              motif:
                MOTIFS[
                  (MOTIFS.indexOf(motif) + MOTIFS.length - 1) % MOTIFS.length
                ],
            })
          }
          aria-label={zh ? "上一母题" : "Previous motif"}
        >
          ←
        </button>
        <span>
          {motifLabels[motif][locale]} · {MOTIFS.indexOf(motif) + 1}/
          {MOTIFS.length}
        </span>
        <button
          onClick={() =>
            update({
              motif: MOTIFS[(MOTIFS.indexOf(motif) + 1) % MOTIFS.length],
            })
          }
          aria-label={zh ? "下一母题" : "Next motif"}
        >
          →
        </button>
      </div>
      <p className="compare-context" role="status">
        {zh
          ? `已选 ${ids.length} 条叙事 · ${themes ? "只看" : "突出显示"}「${motifLabels[motif].zh}」。未收录不代表整个传统不存在这一母题。`
          : `${ids.length} accounts · ${themes ? "Showing" : "Highlighting"} ${motifLabels[motif].en.toLowerCase()}. Missing scenes do not imply absence from an entire tradition.`}
      </p>
      {ids.length < 2 && (
        <p className="timeline-empty">
          {ids.length === 0
            ? zh
              ? "选择两条叙事，开始并读。"
              : "Choose two accounts to begin comparing."
            : zh
              ? "再添加一条叙事，开始并读。"
              : "Add another account to begin comparing."}
        </p>
      )}
      <div
        className="narrative-tracks"
        data-count={ids.length}
        data-themes={themes}
      >
        {ids.map((id, index) => {
          const option = options.find((option) => option.id === id)!;
          const story = stories.find((story) => story.id === option.storyId)!;
          const branch = story.branches?.find(
            (branch) => branch.id === option.branchId,
          );
          const { stages } = resolveReadingPath(
            story.stages,
            story.branches,
            option.branchId ?? null,
            null,
          );
          const hasMotif = stages.some((stage) => stage.motif === motif);
          return (
            <article className="narrative-track" key={id}>
              <header className="narrative-track-heading">
                <div className="track-number">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <button
                    onClick={() =>
                      update({
                        compare: ids.filter((item) => item !== id).join(","),
                      })
                    }
                    aria-label={`${zh ? "移除" : "Remove"} ${option.label}`}
                  >
                    ×
                  </button>
                </div>
                <label htmlFor={`track-${index}`}>
                  {zh ? "传统与版本" : "Tradition and account"}
                </label>
                <select
                  id={`track-${index}`}
                  value={id}
                  onChange={(event) =>
                    update({
                      compare: ids
                        .map((item, i) =>
                          i === index ? event.target.value : item,
                        )
                        .join(","),
                    })
                  }
                >
                  {options.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={item.id !== id && ids.includes(item.id)}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
                <h3>{branch?.label ?? story.shortName}</h3>
                <p>{branch?.description ?? story.region}</p>
                <span className="catalog-no">
                  {stages.length} {zh ? "个叙事节点" : "scenes"}
                </span>
              </header>
              {!hasMotif && (
                <p className="timeline-absence">
                  {zh
                    ? "本次编选未收录这一母题的节点。"
                    : "No scene for this motif is included in this selection."}
                </p>
              )}
              <ol className="narrative-sequence">
                {stages.map((stage, stageIndex) => (
                  <li
                    key={stage.id}
                    className="narrative-node"
                    data-match={stage.motif === motif}
                  >
                    <span
                      className="node-number"
                      aria-label={
                        zh
                          ? `第 ${stageIndex + 1} 幕`
                          : `Scene ${stageIndex + 1}`
                      }
                    >
                      {String(stageIndex + 1).padStart(2, "0")}
                    </span>
                    <p className="node-motif">{stage.motifLabel}</p>
                    <h4>{stage.title}</h4>
                    <p className="node-phase">{stage.phase}</p>
                    <p className="node-summary">
                      {stage.text.split("\n\n")[0]}
                    </p>
                    <details>
                      <summary>
                        {zh ? "阅读这一幕与出处" : "Read scene and source"}
                      </summary>
                      <p className="node-text">{stage.text}</p>
                      <p className="node-source">
                        {stage.source ?? story.source}
                      </p>
                      {stage.entries.map((entry) => (
                        <Link
                          className="node-entry"
                          key={entry.id}
                          href={`/${locale}/entry/${entry.id}?returnTo=${encodeURIComponent(`/${locale}/cosmogony?${params}#compare`)}`}
                        >
                          {entry.label} ↗
                        </Link>
                      ))}
                      <Link
                        className="atlas-panel-link"
                        href={readerHref(story.id, stage.id, branch?.id)}
                      >
                        {zh ? "在完整故事中阅读" : "Open the story reader"}
                      </Link>
                    </details>
                  </li>
                ))}
              </ol>
              <details className="track-sources">
                <summary>
                  {zh ? "版本说明与总出处" : "Selection notes and sources"}
                </summary>
                <p>{story.source}</p>
                {story.note && <p>{story.note}</p>}
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
