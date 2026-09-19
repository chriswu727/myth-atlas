"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { resolveReadingPath } from "@/lib/reading";
import type { Motif } from "@/lib/types";

export interface InteractiveCosmogonyStage {
  id: string;
  source?: string;
  motif: Motif;
  motifLabel: string;
  phase: string;
  title: string;
  text: string;
  entries: { id: string; label: string; image: string | null }[];
}
export interface InteractiveCosmogonyStory {
  id: string;
  name: string;
  shortName: string;
  region: string;
  color: string;
  source: string;
  note?: string | null;
  href: string;
  branches?: {
    id: string;
    label: string;
    description: string;
    stageIds: string[];
  }[];
  stages: InteractiveCosmogonyStage[];
}

export default function InteractiveCosmogonyTimeline({
  story,
  locale,
}: {
  story: InteractiveCosmogonyStory;
  locale: "zh" | "en";
}) {
  const zh = locale === "zh";
  const params = useSearchParams();
  const pathname = usePathname();
  const { branchId, stages, activeIndex } = resolveReadingPath(
    story.stages,
    story.branches,
    params.get("branch"),
    params.get("stage"),
  );
  const branch = story.branches?.find((branch) => branch.id === branchId);
  const activeStage = stages[activeIndex];
  const stageButtons = useRef<Array<HTMLButtonElement | null>>([]);
  function updateSelection(stageId: string, branchId = branch?.id) {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", stageId);
    if (branchId) url.searchParams.set("branch", branchId);
    else url.searchParams.delete("branch");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }
  function selectStage(index: number, moveFocus = false) {
    updateSelection(stages[index].id);
    if (moveFocus) stageButtons.current[index]?.focus();
  }
  function handleStageKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = Math.min(index + 1, stages.length - 1);
    if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = Math.max(index - 1, 0);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = stages.length - 1;
    if (next === index) return;
    event.preventDefault();
    selectStage(next, true);
  }
  return (
    <section
      className="cosmogony-interactive origin-reader"
      style={
        {
          "--timeline-color": story.color,
          "--stage-count": stages.length,
        } as CSSProperties
      }
      aria-label={zh ? `${story.name}创世故事` : `${story.name} origin story`}
    >
      <header className="cosmogony-interactive-header">
        <div>
          <p className="cosmogony-kicker">
            {zh
              ? "故事中的时间 · 按叙事顺序阅读"
              : "STORY TIME · A READING SEQUENCE"}
          </p>
          <h2>{story.name}</h2>
        </div>
        <Link href={story.href}>
          {zh ? "查看这一体系" : "Explore the tradition"}
        </Link>
      </header>
      {story.branches && (
        <div className="origin-branches">
          <p>{zh ? "选择一种讲法" : "Choose an account"}</p>
          <div>
            {story.branches.map((option) => (
              <button
                key={option.id}
                aria-pressed={option.id === branch?.id}
                onClick={() => updateSelection(option.stageIds[0], option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="origin-branch-note">{branch?.description}</p>
        </div>
      )}
      <div className="cosmogony-timeline-layout">
        <nav
          className="creation-stage-nav"
          aria-label={zh ? "选择故事阶段" : "Choose a story stage"}
        >
          <ol>
            {stages.map((stage, index) => (
              <li key={stage.id}>
                <button
                  ref={(element) => {
                    stageButtons.current[index] = element;
                  }}
                  className="creation-stage-button"
                  aria-current={index === activeIndex ? "step" : undefined}
                  onClick={() => selectStage(index)}
                  onKeyDown={(event) => handleStageKeyDown(event, index)}
                >
                  <span className="creation-step-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="creation-step-copy">
                    <span>{stage.motifLabel}</span>
                    <strong>{stage.phase}</strong>
                  </span>
                  <span
                    className="creation-step-mark"
                    data-motif={stage.motif}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <article className="creation-stage-detail" aria-live="polite">
          <span className="creation-stage-watermark" aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <div className="creation-stage-content" key={activeStage.id}>
            <p className="creation-stage-position">
              <span>{activeStage.motifLabel}</span>
              {activeIndex + 1} / {stages.length}
            </p>
            <h3>{activeStage.title}</h3>
            <p className="creation-stage-text">{activeStage.text}</p>
            {activeStage.source && (
              <p className="origin-stage-source">
                {zh ? "本幕依据" : "Sources for this scene"} ·{" "}
                {activeStage.source}
              </p>
            )}
            {activeStage.entries.length > 0 && (
              <div className="origin-characters">
                <p>
                  {zh
                    ? "继续认识故事中的人物与地点"
                    : "Meet the figures and places in this scene"}
                </p>
                <div>
                  {activeStage.entries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/${locale}/entry/${entry.id}?returnTo=${encodeURIComponent(`${pathname}?${params.toString()}`)}`}
                    >
                      {entry.image && (
                        <Image
                          src={entry.image}
                          alt=""
                          width={48}
                          height={60}
                        />
                      )}
                      <span>{entry.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="creation-stage-controls">
            <button
              disabled={activeIndex === 0}
              onClick={() => selectStage(activeIndex - 1)}
            >
              {zh ? "上一幕" : "Previous scene"}
            </button>
            <span>
              {activeIndex + 1} / {stages.length}
            </span>
            <button
              disabled={activeIndex === stages.length - 1}
              onClick={() => selectStage(activeIndex + 1)}
            >
              {zh ? "下一幕" : "Next scene"}
            </button>
          </div>
        </article>
      </div>
      <details className="cosmogony-provenance">
        <summary>{zh ? "版本说明与文献出处" : "Variants and sources"}</summary>
        <div>
          {story.note && (
            <div className="cosmogony-note">
              {story.note.split(/\n\n+/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
          <p className="cosmogony-source">
            <strong>{zh ? "参考文献" : "Sources"}</strong>
            {story.source}
          </p>
        </div>
      </details>
    </section>
  );
}
