import type { MapNode, MapPosition, MapRouteStop } from './map.types';

export type MapRoutePaths = {
  mainPaths: MapPosition[][];
  inactivePaths: MapPosition[][];
  previewPath?: MapPosition[];
};

/** 구간별 실제 길 모양. 키는 getLegKey(출발 노드, 도착 노드)예요. 없는 구간은 직선으로 이어요 */
export type MapLegPaths = Record<string, MapPosition[]>;

/** 같은 두 장소라도 가는 방향에 따라 길이 달라서 방향을 구분해요 */
export const getLegKey = (fromNodeId: string, toNodeId: string) => `${fromNodeId}>${toNodeId}`;

type RoutePoint = { id: string; position: MapPosition };

/** 미리보기는 고른 장소만 대체하고, 다른 구간은 기존 경로를 따라가요. */
export function buildRoutePaths(nodes: MapNode[], route: MapRouteStop[], legPaths: MapLegPaths = {}): MapRoutePaths {
  const positionById = new Map(nodes.map((node) => [node.id, node.position]));
  const toPoint = (id: string | undefined): RoutePoint | undefined => {
    const position = id === undefined ? undefined : positionById.get(id);
    return id !== undefined && position ? { id, position } : undefined;
  };
  // 장소를 순서대로 잇되, 길 모양을 받은 구간은 두 장소 사이에 그 길을 끼워 넣어요
  const join = (points: (RoutePoint | undefined)[]): MapPosition[] =>
    points
      .filter((point): point is RoutePoint => point !== undefined)
      .flatMap((point, index, list) =>
        index === 0 ? [point.position] : [...(legPaths[getLegKey(list[index - 1].id, point.id)] ?? []), point.position],
      );

  const stops = route.flatMap((stop) => {
    const point = toPoint(stop.nodeId);
    return point ? [{ ...stop, point }] : [];
  });
  const main = stops.map((stop) => stop.point);
  const previewIndex = stops.findIndex((stop) => stop.isPlanBPreview && toPoint(stop.planBNodeId));
  const inactivePaths: MapPosition[][] = [];
  let previewPath: MapPosition[] | undefined;

  stops.forEach((stop, index) => {
    const alternative = toPoint(stop.planBNodeId);
    if (!alternative) return;
    const before = main[index - 1];
    const after = main[index + 1];
    const alternativePath = join([before, alternative, after]);
    if (index === previewIndex) {
      previewPath = alternativePath;
      inactivePaths.push(join([before, stop.point, after]));
    } else {
      inactivePaths.push(alternativePath);
    }
  });

  const mainPaths = (previewIndex < 0 ? [main] : [main.slice(0, previewIndex), main.slice(previewIndex + 1)]).map(join);
  return {
    mainPaths: mainPaths.filter((path) => path.length > 1),
    inactivePaths: inactivePaths.filter((path) => path.length > 1),
    previewPath: previewPath && previewPath.length > 1 ? previewPath : undefined,
  };
}
