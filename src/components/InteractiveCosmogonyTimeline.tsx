"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Motif } from "@/lib/types";

export interface InteractiveCosmogonyStage {
  motif: Motif;
  motifLabel: string;
  phase: string;
  title: string;
  text: string;
  entries: { id: string; label: string }[];
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
  stages: InteractiveCosmogonyStage[];
}

export default function InteractiveCosmogonyTimeline({
  story,
  locale,
}: {
  story: InteractiveCosmogonyStory;
  locale: "zh" | "en";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stageButtons = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStage = story.stages[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === story.stages.length - 1;

  function selectStage(index: number, moveFocus = false) {
    setActiveIndex(index);
    if (moveFocus) stageButtons.current[index]?.focus();
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = Math.min(index + 1, story.stages.length - 1);
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = story.stages.length - 1;
    if (next === index) return;
    event.preventDefault();
    selectStage(next, true);
  }

  return (
    <section
      className="cosmogony-interactive"
      style={{ "--timeline-color": story.color, "--stage-count": story.stages.length } as CSSProperties}
      aria-label={locale === "zh" ? `${story.name}创世时间线` : `${story.name} creation timeline`}
    >
      <header className="cosmogony-interactive-header">
        <div>
          <p className="cosmogony-kicker">{locale === "zh" ? "太初纪 · 行旅之卷" : "CHRONICLE OF ORIGINS · A LIVING SCROLL"}</p>
          <h2>{story.name}</h2>
        </div>
        <div className="cosmogony-header-meta">
          <span>{story.region}</span>
          <span>{String(story.stages.length).padStart(2, "0")} {locale === "zh" ? "幕" : "STAGES"}</span>
          <Link href={story.href}>{locale === "zh" ? "步入神系 ↗" : "ENTER THE MYTHIC LINEAGE ↗"}</Link>
        </div>
      </header>

      <div className="cosmogony-timeline-layout">
        <nav className="creation-stage-nav" aria-label={locale === "zh" ? "选择创世阶段" : "Choose a creation stage"}>
          <ol>
            {story.stages.map((stage, index) => {
              const active = index === activeIndex;
              return (
                <li key={`${stage.motif}-${index}`}>
                  <button
                    ref={(element) => { stageButtons.current[index] = element; }}
                    type="button"
                    className="creation-stage-button"
                    aria-current={active ? "step" : undefined}
                    onClick={() => selectStage(index)}
                    onKeyDown={(event) => handleStageKeyDown(event, index)}
                  >
                    <span className="creation-step-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="creation-step-copy">
                      <span>{stage.motifLabel}</span>
                      <strong>{stage.phase}</strong>
                    </span>
                    <span className="creation-step-mark" data-motif={stage.motif} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <article className="creation-stage-detail" aria-live="polite">
          <span className="creation-stage-watermark" aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <div className="creation-stage-content">
            <p className="creation-stage-position">
              <span>{activeStage.motifLabel}</span>
              {activeIndex + 1} / {story.stages.length}
            </p>
            <p className="creation-stage-phase">{activeStage.phase}</p>
            <h3>{activeStage.title}</h3>
            <p className="creation-stage-text">{activeStage.text}</p>

            {activeStage.entries.length > 0 ? (
              <div className="creation-stage-entries">
                <span>{locale === "zh" ? "本幕显形者" : "THOSE WHO APPEAR"}</span>
                <div>
                  {activeStage.entries.map((entry) => (
                    <Link key={entry.id} href={`/${locale}/entry/${entry.id}`}>
                      {entry.label} ↗
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="creation-stage-controls">
            <button type="button" disabled={isFirst} onClick={() => selectStage(activeIndex - 1)}>
              ← {locale === "zh" ? "溯回前一幕" : "Retrace"}
            </button>
            <span aria-hidden="true">
              {story.stages.map((_, index) => (
                <i key={index} data-active={index === activeIndex} />
              ))}
            </span>
            <button type="button" disabled={isLast} onClick={() => selectStage(activeIndex + 1)}>
              {locale === "zh" ? "行至下一幕" : "Continue"} →
            </button>
          </div>
        </article>
      </div>

      <details className="cosmogony-provenance">
        <summary>{locale === "zh" ? "歧说、残章与古卷出处" : "VARIANTS, FRAGMENTS & ANCIENT SOURCES"}</summary>
        <div>
          {story.note ? (
            <div className="cosmogony-note">
              {story.note.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          ) : null}
          <p className="cosmogony-source"><strong>{locale === "zh" ? "古卷所据" : "Drawn from"}</strong>{story.source}</p>
        </div>
      </details>
    </section>
  );
}
