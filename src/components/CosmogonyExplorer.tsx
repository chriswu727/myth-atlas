"use client";

import { useState, type CSSProperties } from "react";
import InteractiveCosmogonyTimeline, { type InteractiveCosmogonyStory } from "@/components/InteractiveCosmogonyTimeline";

export default function CosmogonyExplorer({
  stories,
  locale,
}: {
  stories: InteractiveCosmogonyStory[];
  locale: "zh" | "en";
}) {
  const [selectedId, setSelectedId] = useState(stories[0]?.id ?? "");
  const selected = stories.find((story) => story.id === selectedId) ?? stories[0];

  if (!selected) return null;

  return (
    <div className="cosmogony-explorer">
      <div className="cosmogony-place-index" aria-label={locale === "zh" ? "选择神话传统" : "Choose a mythology"}>
        {stories.map((story, index) => {
          const active = story.id === selected.id;
          return (
            <button
              key={story.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(story.id)}
              style={{ "--place-color": story.color } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{story.shortName}</strong>
              <small>{story.region}</small>
            </button>
          );
        })}
      </div>

      <InteractiveCosmogonyTimeline key={selected.id} story={selected} locale={locale} />
    </div>
  );
}
