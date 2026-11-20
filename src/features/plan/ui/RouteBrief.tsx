import { useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Place } from '@/features/place/model/place.types';
import Button from '@/shared/components/Button';
import { getRouteLegColorToken } from '@/shared/components/Map';
import type { RouteSegment } from '../api/plans';
import { getDayRouteQuery } from '../model/dayRoutes';
import { formatDistance, getDirectionsUrl, getRouteBasis, isRide, MODE_LABELS } from '../lib/routeText';
import TransitLegIcon from './TransitLegIcon';
import styles from './RouteBrief.module.css';

type RouteBriefProps = {
  from: Place;
  to: Place;
  /** 그날 몇 번째 구간인지. 지도·일정과 같은 색을 써요 */
  legIndex: number;
  date: string;
  canFetchRoutes: boolean;
};

/** 막대에서 아주 짧은 구간도 아이콘이 들어갈 만큼은 보여요 */
const MIN_SEGMENT_MINUTES = 3;

function SegmentDot({ segment }: { segment: RouteSegment }) {
  if (isRide(segment.mode)) return <TransitLegIcon className={styles.rideIcon} />;
  return <span className={styles.walkDot} aria-hidden />;
}

const describeSegment = (segment: RouteSegment) => {
  const mode = MODE_LABELS[segment.mode] ?? segment.mode;
  if (!isRide(segment.mode)) return { title: mode, detail: `${segment.minutes}분` };
  // 타는 노선과 내리는 곳. 둘 다 없으면 수단 이름만
  return {
    title: segment.stopName ?? segment.lineName ?? mode,
    detail: [segment.stopName ? segment.lineName ?? mode : null, `${segment.minutes}분`].filter(Boolean).join(' · '),
  };
};

// 피그마 'X배너, 포스터' S4-7a 구간 경로 간단히 보기 / 상세 보기.
// 일정의 이동 줄을 누르면 아래 시트가 이 화면으로 바뀌어요
export default function RouteBrief({ from, to, legIndex, date, canFetchRoutes }: RouteBriefProps) {
  const [isDetail, setIsDetail] = useState(false);
  const route = useQuery(getDayRouteQuery(from, to, date, canFetchRoutes));
  const directionsUrl = getDirectionsUrl(from, to);
  const distance = formatDistance(from, to);
  const legColor = { '--leg-color': `var(${getRouteLegColorToken(legIndex)})` } as CSSProperties;
  const segments = route.data?.segments ?? [];

  // 경로를 못 받으면(로그인 안 함·경로 없음) 바로 지도 앱 길찾기를 보여줘요
  const showsDirections = isDetail || !route.data;

  return (
    <div className={styles.brief} style={legColor}>
      {/* 피그마는 상세보기에서도 제목이 같아요. 어느 두 곳인지는 지도에 그 구간만 남겨 보여줘요 */}
      <h2 className={styles.title}>경로 간단히 보기</h2>

      {route.data ? (
        <>
          <p className={styles.summary}>
            <strong className={styles.minutes}>{route.data.totalMinutes}분</strong>
            <span className={styles.basis}>{getRouteBasis(route.data)}</span>
          </p>
          {segments.length > 0 && (
            <div className={styles.bar} aria-hidden>
              {segments.map((segment, index) => (
                <span
                  key={index}
                  className={isRide(segment.mode) ? styles.rideBar : styles.walkBar}
                  style={{ flexGrow: Math.max(segment.minutes, MIN_SEGMENT_MINUTES) }}
                >
                  <SegmentDot segment={segment} />
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className={styles.basis}>
          {route.isFetching
            ? '경로를 찾는 중이에요'
            : `경로를 불러오지 못했어요.${distance ? ` 직선 ${distance}` : ''}`}
        </p>
      )}

      {isDetail && segments.length > 0 && (
        <ol className={styles.steps}>
          {segments.map((segment, index) => {
            const { title, detail } = describeSegment(segment);
            return (
              <li key={index} className={styles.step}>
                <SegmentDot segment={segment} />
                <span className={isRide(segment.mode) ? styles.stepRide : styles.stepTitle}>{title}</span>
                <span className={styles.stepDetail}>{detail}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className={styles.action}>
        {showsDirections ? (
          directionsUrl && (
            <a className={styles.mapLink} href={directionsUrl} target="_blank" rel="noreferrer">
              지도 앱에서 길찾기
            </a>
          )
        ) : (
          <Button onClick={() => setIsDetail(true)}>상세보기</Button>
        )}
      </div>
    </div>
  );
}
