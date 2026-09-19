"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MOTIFS, type Locale } from "@/lib/types";
import { motifLabels } from "@/lib/i18n";
import type { InteractiveCosmogonyStory } from "./InteractiveCosmogonyTimeline";

export default function CosmogonyCompare({
  stories,
  locale,
}: {
  stories: InteractiveCosmogonyStory[];
  locale: Locale;
}) {
  const zh = locale === "zh";
  const params = useSearchParams();
  const motif =
    MOTIFS.find((motif) => motif === params.get("motif")) ?? "humans";
  const supplied = [
    ...new Set((params.get("compare") ?? "chinese,norse,maya").split(",")),
  ]
    .filter((id) => stories.some((story) => story.id === id))
    .slice(0, 3);
  const ids = supplied.length ? supplied : ["chinese", "norse", "maya"];
  function update(key: string, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}#compare`,
    );
  }
  return (
    <section id="compare" className="origin-compare">
      <div className="journey-section-heading">
        <div>
          <p className="eyebrow">
            02 / {zh ? "并读不同的世界" : "WORLDS SIDE BY SIDE"}
          </p>
          <h2>
            {zh ? "同一个母题，不同的讲法" : "One motif. Different tellings."}
          </h2>
        </div>
        <p>
          {zh
            ? "选一个母题，比较两三个传统。相似之处不自动意味着相互传播。"
            : "Choose a motif and compare a few traditions. Similarity alone does not establish transmission."}
        </p>
      </div>
      <div
        className="motif-choices"
        aria-label={zh ? "选择比较母题" : "Choose a motif"}
      >
        {MOTIFS.map((option) => (
          <button
            key={option}
            aria-pressed={motif === option}
            onClick={() => update("motif", option)}
          >
            {motifLabels[option][locale]}
          </button>
        ))}
      </div>
      <p className="compare-context">
        {zh
          ? `正在比较：${motifLabels[motif].zh}。空白仅表示本馆所选叙事没有这一幕。`
          : `Comparing ${motifLabels[motif].en.toLowerCase()}. An absence refers only to the accounts selected for this collection.`}
      </p>
      <div className="compare-columns">
        {ids.map((id, index) => {
          const story = stories.find((story) => story.id === id)!;
          const stages = story.stages.filter((stage) => stage.motif === motif);
          return (
            <article key={index} className="compare-column">
              <label htmlFor={`compare-${index}`}>
                {zh ? `传统 ${index + 1}` : `Tradition ${index + 1}`}
              </label>
              <select
                id={`compare-${index}`}
                value={id}
                onChange={(event) =>
                  update(
                    "compare",
                    ids
                      .map((value, i) =>
                        i === index ? event.target.value : value,
                      )
                      .join(","),
                  )
                }
              >
                {stories.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                    disabled={ids.includes(option.id) && option.id !== id}
                  >
                    {option.name}
                  </option>
                ))}
              </select>
              <div className="compare-scenes">
                {stages.length ? (
                  stages.map((stage) => {
                    const branch = story.branches?.find((branch) =>
                      branch.stageIds.includes(stage.id),
                    );
                    return (
                      <section key={stage.id}>
                        {branch && <p className="eyebrow">{branch.label}</p>}
                        <h3>{stage.title}</h3>
                        <p>{stage.text}</p>
                        <Link
                          href={`/${locale}/cosmogony?story=${id}&stage=${stage.id}${branch ? `&branch=${branch.id}` : ""}`}
                        >
                          {zh
                            ? "在故事中阅读这一幕"
                            : "Read this scene in context"}
                        </Link>
                      </section>
                    );
                  })
                ) : (
                  <div className="compare-absence">
                    <p>{zh ? "此处留白" : "An absence in this account"}</p>
                    <span>
                      {zh
                        ? "所选叙事未收录这一母题。查看版本说明，了解编选范围。"
                        : "The selected narrative has no scene for this motif. Consult its notes for the scope of the selection."}
                    </span>
                  </div>
                )}
              </div>
              <details>
                <summary>
                  {zh ? "查看出处与版本说明" : "Sources and selection notes"}
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
