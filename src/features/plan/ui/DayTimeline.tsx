import { useQueries } from '@tanstack/react-query';
import { getDistanceKm } from '../lib/planZones';
import { type PlaceRoute, type RouteMode } from '../api/plans';
import { getDayRouteQuery } from '../model/dayRoutes';
import { CATEGORIES } from '@/features/place/lib/categories';
import type { Place } from '@/features/place/model/place.types';
import transitIcon from '@/shared/assets/icons/transit-small.svg';
import styles from './DayTimeline.module.css';

export type TimelineStop = {
  key: string;
  place: Place;
  /** 이 장소 대신 갈 수 있는 곳 */
  planB?: Place;
};

type DayTimelineProps = {
  stops: TimelineStop[];
  isPlanBVisible: boolean;
  /** 그 일차 날짜 (YYYY-MM-DD). 경로를 이 날 기준으로 찾아요 */
  date: string;
  /** 로그인한 사람만 경로 API를 부를 수 있어요. false면 직선거리만 보여줘요 */
  canFetchRoutes: boolean;
};

const MODE_LABELS: Record<RouteMode, string> = {
  WALK: '도보',
  TAXI: '택시',
  SUBWAY: '지하철',
  BUS: '버스',
  TRAIN: '기차',
  TRAM: '트램',
  TRANSIT: '대중교통',
};

const formatDistance = (from: Place, to: Place) => {
  if (!from.location || !to.location) return null;
  const km = getDistanceKm(from.location, to.location);
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
};

const isRide = (mode: RouteMode) => mode !== 'WALK' && mode !== 'TAXI';

/** 초록 글자: 내리는 역 이름. 탈것이 없으면 이동 수단(택시·도보) */
const getMoveLabel = (route: PlaceRoute) => {
  const rides = route.segments.filter((segment) => isRide(segment.mode));
  const lastStop = rides[rides.length - 1]?.stopName;
  if (lastStop) return lastStop;
  const longest = route.segments.reduce((best, segment) => (segment.minutes > best.minutes ? segment : best), route.segments[0]);
  return longest ? (MODE_LABELS[longest.mode] ?? longest.mode) : '이동';
};

/** '대중교통, 최단시간 기준 | 18분'. 탈것이 없으면 앞의 초록 글자가 수단(택시·도보)이라 다시 쓰지 않아요 */
const getMoveText = (route: PlaceRoute) => {
  const hasRide = route.segments.some((segment) => isRide(segment.mode));
  return (hasRide ? '대중교통, ' : '') + '최단시간 기준 | ' + route.totalMinutes + '분';
};

/** 자세한 길 안내는 지도 앱에 맡겨요 (기능명세서 4-4 경로 간단히 보기) */
const getDirectionsUrl = (from: Place, to: Place) => {
  if (!from.location || !to.location) return null;
  const params = new URLSearchParams({
    api: '1',
    origin: `${from.location.lat},${from.location.lng}`,
    destination: `${to.location.lat},${to.location.lng}`,
    travelmode: 'transit',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

function StopRow({ place, isPlanB = false }: { place: Place; isPlanB?: boolean }) {
  const category = CATEGORIES[place.category];
  return (
    <div className={isPlanB ? styles.planBRow : styles.stopRow}>
      <span className={styles.iconSlot}>
        {category.icon && (
          <img
            src={category.icon.src}
            alt=""
            className={category.icon.isFlipped ? styles.iconFlipped : styles.icon}
          />
        )}
      </span>
      <span className={styles.category}>{isPlanB ? '플랜B' : category.label}</span>
      <span className={styles.name}>{place.name}</span>
    </div>
  );
}

// 계획 보기 아래쪽 시트의 일차 동선 목록 (기능명세서 4-4)
export default function DayTimeline({ stops, isPlanBVisible, date, canFetchRoutes }: DayTimelineProps) {
  const pairs = stops.slice(0, -1).map((stop, index) => ({ from: stop.place, to: stops[index + 1].place }));
  const routes = useQueries({
    queries: pairs.map(({ from, to }) => getDayRouteQuery(from, to, date, canFetchRoutes)),
  });

  const renderMove = (index: number) => {
    const { from, to } = pairs[index];
    const route = routes[index];
    const distance = formatDistance(from, to);
    const directionsUrl = getDirectionsUrl(from, to);
    let text = `다음 장소까지${distance ? ` 직선 ${distance}` : ''}`;
    if (route.data) text = getMoveText(route.data);
    else if (route.isFetching) text = '경로를 찾는 중이에요';
    return (
      <div className={styles.moveRow}>
        <img src={transitIcon} alt="" className={styles.moveIcon} />
        {route.data && <span className={styles.moveLabel}>{getMoveLabel(route.data)}</span>}
        <span className={styles.moveText}>{text}</span>
        {directionsUrl && (
          <a className={styles.moveLink} href={directionsUrl} target="_blank" rel="noreferrer">
            길찾기
          </a>
        )}
      </div>
    );
  };

  return (
    <ol className={styles.list}>
      {stops.map((stop, index) => (
        <li key={stop.key} className={styles.item}>
          <StopRow place={stop.place} />
          {isPlanBVisible && stop.planB && <StopRow place={stop.planB} isPlanB />}
          {index < pairs.length && renderMove(index)}
        </li>
      ))}
    </ol>
  );
}
