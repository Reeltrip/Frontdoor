import type { MapNode, MapPosition, MapRouteStop } from './map.types';

export type MapRouteLeg = { key: string; path: MapPosition[] };

export type MapRoutePaths = {
  mainPaths: MapPosition[][];
  /** 확정한 동선을 구간마다 나눈 것. 계획 보기에서 구간마다 색을 다르게 그릴 때 써요 */
  mainLegs: MapRouteLeg[];
  inactivePaths: MapPosition[][];
  previewPath?: MapPosition[];
};

/** 구간별 실제 길 모양. 키는 getLegKey(출발 노드, 도착 노드)예요. 없는 구간은 직선으로 이어요 */
export type MapLegPaths = Record<string, MapPosition[]>;

/** 같은 두 장소라도 가는 방향에 따라 길이 달라서 방향을 구분해요 */
export const getLegKey = (fromNodeId: string, toNodeId: string) => `${fromNodeId}>${toNodeId}`;

type RoutePoint = { id: string; position: MapPosition };

/** 플랜 B는 앞 장소에서 갈라져 다음 장소에서 합쳐져요. 고르는 중(미리보기)에도 원래 동선은 그대로 둬요. */
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
    if (index === previewIndex) previewPath = alternativePath;
    else inactivePaths.push(alternativePath);
  });

  const mainPaths = [join(main)];
  const mainLegs = main.slice(1).map((point, index) => ({ key: getLegKey(main[index].id, point.id), path: join([main[index], point]) }));
  return {
    mainPaths: mainPaths.filter((path) => path.length > 1),
    mainLegs,
    inactivePaths: inactivePaths.filter((path) => path.length > 1),
    previewPath: previewPath && previewPath.length > 1 ? previewPath : undefined,
  };
}
