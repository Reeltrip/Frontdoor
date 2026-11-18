import type { MapNode, MapPosition, MapRouteStop } from './map.types';

export type MapRoutePaths = {
  mainPaths: MapPosition[][];
  inactivePaths: MapPosition[][];
  previewPath?: MapPosition[];
};

const throughStop = (before: MapPosition | undefined, position: MapPosition, after: MapPosition | undefined) =>
  [before, position, after].filter((point): point is MapPosition => point !== undefined);

/** 미리보기는 고른 장소만 대체하고, 다른 구간은 기존 경로를 따라가요. */
export function buildRoutePaths(nodes: MapNode[], route: MapRouteStop[]): MapRoutePaths {
  const positionById = new Map(nodes.map((node) => [node.id, node.position]));
  const stops = route.flatMap((stop) => {
    const position = positionById.get(stop.nodeId);
    return position ? [{ ...stop, position }] : [];
  });
  const main = stops.map((stop) => stop.position);
  const previewIndex = stops.findIndex((stop) => stop.isPlanBPreview && stop.planBNodeId && positionById.has(stop.planBNodeId));
  const inactivePaths: MapPosition[][] = [];
  let previewPath: MapPosition[] | undefined;

  stops.forEach((stop, index) => {
    const alternative = stop.planBNodeId ? positionById.get(stop.planBNodeId) : undefined;
    if (!alternative) return;
    const before = main[index - 1];
    const after = main[index + 1];
    const alternativePath = throughStop(before, alternative, after);
    if (index === previewIndex) {
      previewPath = alternativePath;
      inactivePaths.push(throughStop(before, stop.position, after));
    } else {
      inactivePaths.push(alternativePath);
    }
  });

  const mainPaths = previewIndex < 0 ? [main] : [main.slice(0, previewIndex), main.slice(previewIndex + 1)];
  return {
    mainPaths: mainPaths.filter((path) => path.length > 1),
    inactivePaths: inactivePaths.filter((path) => path.length > 1),
    previewPath: previewPath && previewPath.length > 1 ? previewPath : undefined,
  };
}
