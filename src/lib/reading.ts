export function resolveReadingPath<T extends { id: string }>(
  stages: T[],
  branches: { id: string; stageIds: string[] }[] | undefined,
  branchId: string | null,
  stageId: string | null,
) {
  const branch =
    branches?.find((branch) => branch.id === branchId) ?? branches?.[0];
  const path = branch
    ? branch.stageIds.flatMap(
        (id) => stages.find((stage) => stage.id === id) ?? [],
      )
    : stages;
  return {
    branchId: branch?.id,
    stages: path,
    activeIndex: Math.max(
      0,
      path.findIndex((stage) => stage.id === stageId),
    ),
  };
}
