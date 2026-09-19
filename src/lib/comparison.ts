import type { L } from "./types";

export interface ComparisonSource {
  id: string;
  title: L;
  url: string;
}

export interface ComparisonEvent {
  id: string;
  step: string;
  title: L;
  text: L;
  status: "attested" | "not-stated";
  tags: string[];
  source: string;
  locator: L;
}

export interface ComparisonStory {
  id: string;
  tradition: string;
  name: L;
  account: L;
  note: L;
  color: string;
  entries: string[];
  events: ComparisonEvent[];
}

export interface ComparisonTopic {
  id: string;
  steps: { id: string; title: L; question: L }[];
  tags: { id: string; label: L }[];
  sources: ComparisonSource[];
  stories: ComparisonStory[];
}

export function comparisonSelection(
  topic: ComparisonTopic,
  value: string | null,
) {
  const ids = [...new Set((value ?? "").split(","))].filter((id) =>
    topic.stories.some((story) => story.id === id),
  );
  return ids.length >= 2 ? ids : topic.stories.map((story) => story.id);
}

export function sharedTags(stories: ComparisonStory[], step: string) {
  const counts = new Map<string, number>();
  for (const story of stories) {
    const event = story.events.find((event) => event.step === step);
    for (const tag of new Set(event?.tags ?? [])) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return new Set(
    [...counts].filter(([, count]) => count > 1).map(([id]) => id),
  );
}
