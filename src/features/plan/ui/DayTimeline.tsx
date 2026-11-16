import { getDistanceKm } from '../lib/planZones';
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
};

const formatDistance = (from: Place, to: Place) => {
  if (!from.location || !to.location) return null;
  const km = getDistanceKm(from.location, to.location);
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
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
export default function DayTimeline({ stops, isPlanBVisible }: DayTimelineProps) {
  return (
    <ol className={styles.list}>
      {stops.map((stop, index) => {
        const next = stops[index + 1];
        // 실제 소요 시간은 BE 경로 API가 정해지면 붙여요. 지금은 직선거리만 보여줘요
        const distance = next ? formatDistance(stop.place, next.place) : null;
        return (
          <li key={stop.key} className={styles.item}>
            <StopRow place={stop.place} />
            {isPlanBVisible && stop.planB && <StopRow place={stop.planB} isPlanB />}
            {next && (
              <div className={styles.moveRow}>
                <img src={transitIcon} alt="" className={styles.moveIcon} />
                <span className={styles.moveText}>
                  다음 장소까지{distance ? ` 직선 ${distance}` : ''}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
