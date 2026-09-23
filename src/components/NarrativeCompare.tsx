"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type CSSProperties } from "react";
import {
  comparisonSelection,
  sharedTags,
  type ComparisonEvent,
  type ComparisonStory,
  type ComparisonTopic,
} from "@/lib/comparison";
import type { Locale } from "@/lib/types";

export default function NarrativeCompare({
  topic,
  locale,
}: {
  topic: ComparisonTopic;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const params = useSearchParams();
  const pathname = usePathname();
  const [mobileAll, setMobileAll] = useState(false);
  const ids = comparisonSelection(topic, params.get("traditions"));
  const stories = ids.map((id) =>
    topic.stories.find((story) => story.id === id)!,
  );
  const step = topic.steps.some((step) => step.id === params.get("step"))
    ? params.get("step")
    : null;
  const view = params.get("view") === "stories" ? "stories" : "compare";
  const mobileStepIndex = Math.max(
    0,
    topic.steps.findIndex((item) => item.id === step),
  );
  const returnTo = `${pathname}${params.size ? `?${params}` : ""}#narratives`;

  function update(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}#narratives`,
    );
  }

  function renderEvent(
    story: ComparisonStory,
    event: ComparisonEvent,
    common: Set<string>,
  ) {
    const source = topic.sources.find((source) => source.id === event.source)!;
    return (
      <article
        className="process-event"
        data-status={event.status}
        style={{ "--story-color": story.color } as CSSProperties}
      >
        <p className="process-culture">{story.name[locale]}</p>
        <h3>{event.title[locale]}</h3>
        <p>{event.text[locale]}</p>
        {event.tags.length > 0 && (
          <div className="process-tags">
            {event.tags.map((tag) => (
              <span
                key={tag}
                data-shared={common.has(tag)}
                title={
                  common.has(tag)
                    ? zh
                      ? "当前对照中，其他故事也有这一细节"
                      : "Also present in another selected account"
                    : undefined
                }
              >
                {common.has(tag) && <span aria-hidden="true">↔ </span>}
                {topic.tags.find((item) => item.id === tag)!.label[locale]}
              </span>
            ))}
          </div>
        )}
        <details className="process-evidence">
          <summary>{zh ? "出处与版本" : "Source and account"}</summary>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title[locale]} ↗
          </a>
          <p>{event.locator[locale]}</p>
          <p>{story.note[locale]}</p>
        </details>
      </article>
    );
  }

  return (
    <section className="narrative-explorer" data-mobile-all={mobileAll}>
      <div className="process-controls">
        <fieldset>
          <legend>
            {topic.stories.length === 2
              ? zh
                ? "本次并读的两个版本"
                : "The two accounts compared"
              : zh
                ? "选择一起阅读的故事 · 至少两则"
                : "Choose accounts · at least two"}
          </legend>
          <div className="culture-choices">
            {topic.stories.map((story) => (
              <button
                key={story.id}
                aria-pressed={ids.includes(story.id)}
                disabled={ids.length === 2 && ids.includes(story.id)}
                onClick={() =>
                  update(
                    "traditions",
                    (ids.includes(story.id)
                      ? ids.filter((id) => id !== story.id)
                      : [...ids, story.id]
                    ).join(","),
                  )
                }
              >
                <span style={{ background: story.color }} aria-hidden="true" />
                {story.name[locale]}
              </button>
            ))}
          </div>
        </fieldset>
        <div
          className="process-view"
          aria-label={zh ? "阅读方式" : "Reading view"}
        >
          <button
            aria-pressed={view === "compare"}
            onClick={() => update("view", null)}
          >
            {zh ? "过程对照" : "Compare stages"}
          </button>
          <button
            aria-pressed={view === "stories"}
            onClick={() => update("view", "stories")}
          >
            {zh ? "按故事读" : "Read each story"}
          </button>
        </div>
      </div>
      <p className="process-guide">
        {view === "compare"
          ? zh
            ? "选择一个环节，并读不同故事。↔ 标出当前所选故事在同一环节共享的细节。对齐的是比较问题，不代表同时发生；「按故事读」可逐则查看整理后的过程。"
            : "Choose a stage and compare the accounts. ↔ marks details shared within that stage. The alignment follows questions, not dates; the story view follows each account’s edited sequence."
          : zh
            ? "逐则阅读本站依所选文本整理的过程。未交代的环节单独列在最后，不补成一个事件；合读版本的编排方式见「出处与版本」。"
            : "Read each sequence as edited from the selected texts. Unstated stages appear separately at the end; source notes explain combined accounts."}
      </p>
      {view === "compare" && (
        <nav
          className="process-steps"
          aria-label={zh ? "聚焦一个叙事环节" : "Focus on a stage"}
        >
          <button
            aria-pressed={!step}
            onClick={() => {
              setMobileAll(true);
              update("step", null);
            }}
          >
            {zh ? "完整过程" : "All stages"}
          </button>
          {topic.steps.map((item, index) => (
            <button
              key={item.id}
              aria-pressed={step === item.id}
              onClick={() => update("step", item.id)}
            >
              {String(index + 1).padStart(2, "0")} {item.title[locale]}
            </button>
          ))}
        </nav>
      )}
      {view === "compare" && (
        <div className="process-mobile-pager">
          <button
            disabled={mobileStepIndex === 0}
            onClick={() => {
              setMobileAll(false);
              update("step", topic.steps[mobileStepIndex - 1].id);
            }}
            aria-label={zh ? "上一环节" : "Previous stage"}
          >
            ←
          </button>
          <span>
            {topic.steps[mobileStepIndex].title[locale]} · {mobileStepIndex + 1}
            /{topic.steps.length}
          </span>
          <button
            disabled={mobileStepIndex === topic.steps.length - 1}
            onClick={() => {
              setMobileAll(false);
              update("step", topic.steps[mobileStepIndex + 1].id);
            }}
            aria-label={zh ? "下一环节" : "Next stage"}
          >
            →
          </button>
        </div>
      )}
      <div className="process-result-count" role="status">
        {zh
          ? `正在并读 ${stories.length} 则叙事`
          : `Reading ${stories.length} accounts together`}
      </div>
      <div
        className="process-columns"
        style={{ "--story-count": stories.length } as CSSProperties}
      >
        {view === "compare" && (
          <div className="process-headings">
            <p className="eyebrow">{zh ? "故事的过程 ↓" : "THE SEQUENCE ↓"}</p>
            {stories.map((story) => (
              <div
                key={story.id}
                style={{ "--story-color": story.color } as CSSProperties}
              >
                <h2>{story.name[locale]}</h2>
                <p>{story.account[locale]}</p>
                <Link
                  href={`/${locale}?realm=${story.tradition}&pin=${story.entries[0]}#atlas`}
                >
                  {zh ? "在地图上看" : "Find on the map"} ↗
                </Link>
              </div>
            ))}
          </div>
        )}
        {view === "compare" ? (
          topic.steps
            .filter((item) => !step || item.id === step)
            .map((item) => (
              <section
                className="process-row"
                data-mobile-visible={
                  item.id === topic.steps[mobileStepIndex].id
                }
                key={item.id}
                aria-label={item.title[locale]}
              >
                <div className="process-row-label">
                  <span>
                    {String(topic.steps.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                  <h2>{item.title[locale]}</h2>
                  <p>{item.question[locale]}</p>
                </div>
                {stories.map((story) => (
                  <div key={story.id}>
                    {renderEvent(
                      story,
                      story.events.find((event) => event.step === item.id)!,
                      sharedTags(stories, item.id),
                    )}
                  </div>
                ))}
              </section>
            ))
        ) : (
          <div className="process-story-grid">
            {stories.map((story) => (
              <section key={story.id} aria-label={story.account[locale]}>
                <h2>{story.account[locale]}</h2>
                {story.events
                  .filter((event) => event.status === "attested")
                  .map((event, index) => (
                    <div className="process-story-event" key={event.id}>
                      <span className="eyebrow">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {renderEvent(story, event, new Set())}
                    </div>
                  ))}
                {story.events
                  .filter((event) => event.status === "not-stated")
                  .map((event) => (
                    <div key={event.id}>
                      {renderEvent(story, event, new Set())}
                    </div>
                  ))}
                <p>{story.note[locale]}</p>
              </section>
            ))}
          </div>
        )}
      </div>
      <div className="process-continue">
        <h2>{zh ? "继续读完整条目" : "Continue to the full records"}</h2>
        {stories.map((story) => (
          <div key={story.id}>
            <span>{story.account[locale]}</span>
            <Link
              href={`/${locale}?realm=${story.tradition}&pin=${story.entries[0]}#atlas`}
            >
              {zh ? "查看所属地区" : "Explore the region"}
            </Link>
            <Link
              href={`/${locale}/entry/${story.entries[0]}?returnTo=${encodeURIComponent(returnTo)}`}
            >
              {zh ? "阅读相关条目" : "Read the related record"} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
