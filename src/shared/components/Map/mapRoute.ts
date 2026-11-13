import type { MapNode, MapPosition, MapRouteStop } from './map.types';

export type MapRoutePaths = {
  /** 확정한 순서대로 이은 선 */
  mainPath: MapPosition[];
  /** 플랜B마다 선 하나: 앞 지점 → 플랜B 노드 → 다음 지점 */
  planBPaths: MapPosition[][];
};

/**
 * 동선을 지도에 그릴 좌표 목록으로 바꿔요.
 * nodes에 없는 지점(삭제된 장소 등)은 건너뛰고 남은 지점끼리 이어요.
 */
export function buildRoutePaths(nodes: MapNode[], route: MapRouteStop[]): MapRoutePaths {
  const positionById = new Map(nodes.map((node) => [node.id, node.position]));

  const stops = route.flatMap((stop) => {
    const position = positionById.get(stop.nodeId);
    return position ? [{ position, planBNodeId: stop.planBNodeId }] : [];
  });

  const planBPaths = stops.flatMap((stop, index) => {
    const planBPosition = stop.planBNodeId ? positionById.get(stop.planBNodeId) : undefined;
    if (!planBPosition) return [];

    // 첫 지점·마지막 지점의 플랜B는 한쪽만 이어져요
    const path = [stops[index - 1]?.position, planBPosition, stops[index + 1]?.position].filter(
      (position): position is MapPosition => position !== undefined,
    );
    return path.length > 1 ? [path] : [];
  });

  return { mainPath: stops.map((stop) => stop.position), planBPaths };
}
