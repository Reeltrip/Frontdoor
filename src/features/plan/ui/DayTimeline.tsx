import type { CSSProperties } from 'react';
import { useQueries } from '@tanstack/react-query';
import { formatDistance, getMoveLabel, getMoveText } from '../lib/routeText';
import { getDayRouteQuery } from '../model/dayRoutes';
import { CATEGORIES } from '@/features/place/lib/categories';
import type { Place } from '@/features/place/model/place.types';
import { getRouteLegColorToken } from '@/shared/components/Map';
import TransitLegIcon from './TransitLegIcon';
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
  /** 이동 줄을 누르면 그 구간의 경로 간단히 보기를 열어요 (S4-7a) */
  onSelectLeg: (legIndex: number) => void;
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
export default function DayTimeline({ stops, isPlanBVisible, date, canFetchRoutes, onSelectLeg }: DayTimelineProps) {
  const pairs = stops.slice(0, -1).map((stop, index) => ({ from: stop.place, to: stops[index + 1].place }));
  const routes = useQueries({
    queries: pairs.map(({ from, to }) => getDayRouteQuery(from, to, date, canFetchRoutes)),
  });

  const renderMove = (index: number) => {
    const { from, to } = pairs[index];
    const route = routes[index];
    const distance = formatDistance(from, to);
    let text = `다음 장소까지${distance ? ` 직선 ${distance}` : ''}`;
    if (route.data) text = getMoveText(route.data);
    else if (route.isFetching) text = '경로를 찾는 중이에요';
    return (
      // 지도 동선과 같은 순서로 같은 색을 써서 어느 선이 이 구간인지 맞춰 볼 수 있어요.
      // 누르면 그 구간의 경로 간단히 보기를 열어요. 지도 앱 길찾기는 거기로 옮겼어요
      <button
        type="button"
        className={styles.moveRow}
        style={{ '--leg-color': `var(${getRouteLegColorToken(index)})` } as CSSProperties}
        onClick={() => onSelectLeg(index)}
        aria-label={`${from.name}에서 ${to.name}까지 경로 보기`}
      >
        <TransitLegIcon className={styles.moveIcon} />
        {route.data && <span className={styles.moveLabel}>{getMoveLabel(route.data)}</span>}
        <span className={styles.moveText}>{text}</span>
        <span className={styles.moveChevron} aria-hidden>
          ›
        </span>
      </button>
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
