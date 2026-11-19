import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { MapView, decodePolyline, getLegKey, getRouteLegColorToken, type MapLegPaths, type MapViewProps } from '@/shared/components/Map';
import type { Place } from '@/features/place/model/place.types';
import { getDayRouteQuery } from '../model/dayRoutes';

type DayRouteMapProps = Omit<MapViewProps, 'legPaths' | 'legColors'> & {
  /** 그 일차에 들르는 장소를 순서대로 (숙소 포함) */
  stopPlaces: Place[];
  /** 그 일차 날짜 (YYYY-MM-DD) */
  date: string;
  /** 로그인한 사람만 경로 API를 부를 수 있어요. false면 직선으로 그려요 */
  canFetchRoutes: boolean;
};

// 계획 보기 지도. 동선을 장소끼리 직선으로 잇지 않고 실제 길을 따라 그려요.
// 길 모양은 타임라인이 소요시간을 받으려고 부르는 경로 조회에 같이 들어 있어서 호출이 늘지 않아요
export default function DayRouteMap({ stopPlaces, date, canFetchRoutes, ...mapProps }: DayRouteMapProps) {
  const pairs = stopPlaces.slice(0, -1).map((from, index) => ({ from, to: stopPlaces[index + 1] }));
  const routes = useQueries({
    queries: pairs.map(({ from, to }) => getDayRouteQuery(from, to, date, canFetchRoutes)),
  });

  // 조회 결과 배열은 그릴 때마다 새로 만들어져요. 길 모양이 실제로 바뀔 때만 선을 다시 계산하게 글자로 비교해요
  const signature = pairs
    .map(({ from, to }, index) => `${getLegKey(from.id, to.id)}=${routes[index]?.data?.polyline ?? ''}`)
    .join('\n');
  // 구간 색도 순서대로 다르게 해요. 일정 목록(DayTimeline)도 같은 순서로 같은 색을 써요
  const { legPaths, legColors } = useMemo(() => {
    const paths: MapLegPaths = {};
    const colors: Record<string, string> = {};
    signature.split('\n').forEach((line, index) => {
      const separator = line.indexOf('=');
      if (separator <= 0) return;
      const key = line.slice(0, separator);
      colors[key] = getRouteLegColorToken(index);
      const path = decodePolyline(line.slice(separator + 1));
      // 받지 못했거나 풀지 못한 구간은 넣지 않아요. 지도가 그 구간을 직선으로 그려요
      if (path.length > 1) paths[key] = path;
    });
    return { legPaths: paths, legColors: colors };
  }, [signature]);

  return <MapView {...mapProps} legPaths={legPaths} legColors={legColors} />;
}
