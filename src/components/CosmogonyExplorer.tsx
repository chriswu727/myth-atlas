"use client";

import { useSearchParams } from "next/navigation";
import InteractiveCosmogonyTimeline, {
  type InteractiveCosmogonyStory,
} from "@/components/InteractiveCosmogonyTimeline";

export default function CosmogonyExplorer({
  stories,
  locale,
}: {
  stories: InteractiveCosmogonyStory[];
  locale: "zh" | "en";
}) {
  const params = useSearchParams();
  const selected =
    stories.find((story) => story.id === params.get("story")) ?? stories[0];
  function choose(id: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("story", id);
    url.searchParams.delete("branch");
    url.searchParams.delete("stage");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }
  return (
    <div className="cosmogony-explorer">
      <div className="origin-selector">
        <label htmlFor="origin-tradition">
          {locale === "zh" ? "选择一个传统" : "Choose a tradition"}
        </label>
        <select
          id="origin-tradition"
          value={selected.id}
          onChange={(event) => choose(event.target.value)}
        >
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.name}
            </option>
          ))}
        </select>
        <span>
          {locale === "zh"
            ? "叙事顺序不等于文献年代。不同讲法分别阅读。"
            : "Narrative order is not historical dating. Read alternative accounts separately."}
        </span>
      </div>
      <InteractiveCosmogonyTimeline
        key={selected.id}
        story={selected}
        locale={locale}
      />
    </div>
  );
}
