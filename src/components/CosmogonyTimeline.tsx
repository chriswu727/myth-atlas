import { Suspense } from "react";
import InteractiveCosmogonyTimeline, {
  type InteractiveCosmogonyStory,
} from "@/components/InteractiveCosmogonyTimeline";
import { getEntry, getTradition, getDisplayImage } from "@/lib/data";
import { motifLabels } from "@/lib/i18n";
import type { Cosmogony, Locale } from "@/lib/types";

export function toInteractiveCosmogony(
  cosmogony: Cosmogony,
  locale: Locale,
): InteractiveCosmogonyStory {
  const tradition = getTradition(cosmogony.tradition);
  if (!tradition) throw new Error(`Unknown tradition: ${cosmogony.tradition}`);

  return {
    id: tradition.id,
    name: tradition.name[locale],
    shortName: tradition.shortName[locale],
    region: tradition.region[locale],
    color: tradition.color,
    source: cosmogony.source[locale],
    note: cosmogony.note?.[locale],
    href: `/${locale}/tradition/${tradition.id}`,
    branches: cosmogony.branches?.map((branch) => ({
      id: branch.id,
      label: branch.label[locale],
      description: branch.description[locale],
      stageIds: branch.stageIds,
    })),
    stages: cosmogony.stages.map((stage, index) => ({
      id: stage.id ?? `stage-${index + 1}`,
      source: stage.source?.[locale],
      motif: stage.motif,
      motifLabel: motifLabels[stage.motif][locale],
      phase: stage.phase[locale],
      title: stage.title[locale],
      text: stage.text[locale],
      entries: (stage.entries ?? []).flatMap((id) => {
        const entry = getEntry(id);
        return entry
          ? [
              {
                id: entry.id,
                label: entry.name[locale],
                image: getDisplayImage(entry)?.file ?? null,
              },
            ]
          : [];
      }),
    })),
  };
}

export default function CosmogonyTimeline({
  cosmogony,
  locale,
}: {
  cosmogony: Cosmogony;
  locale: Locale;
}) {
  return (
    <Suspense
      fallback={
        <p>
          {locale === "zh" ? "正在展开创世故事…" : "Opening the origin story…"}
        </p>
      }
    >
      <InteractiveCosmogonyTimeline
        story={toInteractiveCosmogony(cosmogony, locale)}
        locale={locale}
      />
    </Suspense>
  );
}
