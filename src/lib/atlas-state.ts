/** Shared URL contract for map selections and independent narrative tracks. */
export interface NarrativeCollection {
  id: string;
  name: string;
  branches?: { id: string; label: string; stageIds: string[] }[];
}

export interface NarrativeOption {
  id: string;
  storyId: string;
  branchId: string | undefined;
  label: string;
}

export function narrativeOptions(
  stories: NarrativeCollection[],
): NarrativeOption[] {
  return stories.flatMap<NarrativeOption>((story) =>
    story.branches?.length
      ? story.branches.map((branch) => ({
          id: `${story.id}:${branch.id}`,
          storyId: story.id,
          branchId: branch.id,
          label: `${story.name} · ${branch.label}`,
        }))
      : [
          {
            id: story.id,
            storyId: story.id,
            branchId: undefined,
            label: story.name,
          },
        ],
  );
}

/** Old tradition-only links resolve to that collection's first independent account. */
export function comparisonIds(
  value: string | null,
  options: { id: string; storyId: string }[],
  defaults: string[] = [],
) {
  const ids = (value === null ? defaults : value.split(",")).flatMap((id) => {
    const option =
      options.find((option) => option.id === id.trim()) ??
      options.find((option) => option.storyId === id.trim());
    return option ? [option.id] : [];
  });
  return [...new Set(ids)].slice(0, 3);
}

export function selectedMapEntry<T extends { id: string }>(
  id: string | null,
  featured: T[],
  pins: (T & { traditionId: string })[],
  traditionId: string | null,
) {
  return (
    pins.find((pin) => pin.id === id && pin.traditionId === traditionId) ??
    featured.find((entry) => entry.id === id)
  );
}

export function readMapView(
  params: Pick<URLSearchParams, "get">,
  width: number,
  height: number,
) {
  const finite = (key: string, fallback: number) => {
    const raw = params.get(key);
    const n = raw === null ? fallback : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  const k = Math.max(1, Math.min(9, finite("z", 1)));
  return {
    k,
    x: Math.max(width * (1 - k), Math.min(0, finite("x", 0))),
    y: Math.max(height * (1 - k), Math.min(0, finite("y", 0))),
  };
}
