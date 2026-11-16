import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import Header from '@/shared/components/Header';
import { LoadingSpinner } from '@/shared/components/Loading';
import { DEFAULT_MAP_CENTER, MapView, type MapPosition } from '@/shared/components/Map';
import editIcon from '@/shared/assets/icons/edit-circle.svg';
import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import { toMapNodes } from '@/features/place/lib/mapNodes';
import { usePlaces } from '@/features/place/model/usePlaces';
import type { Place } from '@/features/place/model/place.types';
import { findZone } from '@/features/plan/lib/planZones';
import { formatDayDate } from '@/features/plan/model/planDays';
import { buildDayRoute } from '@/features/plan/model/planEdit';
import { usePlan } from '@/features/plan/model/usePlan';
import DaySelector from '@/features/plan/ui/DaySelector';
import DayTimeline, { type TimelineStop } from '@/features/plan/ui/DayTimeline';
import styles from './PlanViewPage.module.css';

/** 아래 시트가 지도 아래쪽을 가려서, 동선 가운데보다 조금 남쪽을 지도 가운데로 잡아요 */
const SHEET_LAT_OFFSET = 0.004;

const getRouteCenter = (places: Place[]): MapPosition | undefined => {
  const positions = places.flatMap((place) => (place.location ? [place.location] : []));
  if (positions.length === 0) return undefined;
  const lats = positions.map((position) => position.lat);
  const lngs = positions.map((position) => position.lng);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2 - SHEET_LAT_OFFSET,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};

// 계획 완성 보기 (기능명세서 4-4). 일자를 바꿔 가며 그날 동선을 지도와 목록으로 봐요
export default function PlanViewPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const { plan, viewStatus, error, refetch } = usePlan(planId);
  const { places } = usePlaces();
  const [dayIndex, setDayIndex] = useState(0);
  const [isPlanBVisible, setIsPlanBVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (viewStatus === 'loading') {
    return (
      <main className={styles.center}>
        <LoadingSpinner label="여행 계획을 불러오는 중" />
      </main>
    );
  }

  if (viewStatus === 'error' || !plan) {
    return (
      <main className={styles.center} role="alert">
        <p className={styles.statusTitle}>여행 계획을 불러오지 못했어요.</p>
        <p className={styles.statusText}>{getErrorMessage(error)}</p>
        <Button size="sm" isFullWidth={false} onClick={() => refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  const day = plan.days[dayIndex] ?? plan.days[0];
  const placeById = new Map(places.map((place) => [place.id, place]));
  const lodging = plan.accommodationPlaceId ? placeById.get(plan.accommodationPlaceId) : undefined;
  const editPath = `/plans/${plan.id}/edit`;

  // 숙소에서 출발해 확정한 순서대로 돌고 숙소로 돌아와요
  const nodeStops: TimelineStop[] = day.nodes.flatMap((node) => {
    const place = placeById.get(node.placeId);
    if (!place) return [];
    return [{ key: node.id, place, planB: node.planB ? placeById.get(node.planB.placeId) : undefined }];
  });
  const withLodging: TimelineStop[] =
    lodging && nodeStops.length > 0
      ? [{ key: 'lodging-start', place: lodging }, ...nodeStops, { key: 'lodging-end', place: lodging }]
      : nodeStops;
  // 숙소를 첫 장소로도 고른 경우처럼 같은 곳이 연달아 나오면 한 번만 보여줘요
  const stops = withLodging.filter((stop, index) => stop.place.id !== withLodging[index - 1]?.place.id);

  const route = buildDayRoute(plan, dayIndex).map((stop) =>
    isPlanBVisible ? stop : { nodeId: stop.nodeId },
  );
  const routePlaceIds = new Set(route.flatMap((stop) => [stop.nodeId, ...(stop.planBNodeId ? [stop.planBNodeId] : [])]));
  const mapNodes = toMapNodes(places.filter((place) => routePlaceIds.has(place.id)));
  const hasPlanB = day.nodes.some((node) => node.planB);

  const mapCenter = getRouteCenter(stops.map((stop) => stop.place)) ?? findZone(day.zone)?.center ?? DEFAULT_MAP_CENTER;

  const selectDay = (nextIndex: number) => {
    setDayIndex(nextIndex);
    setSelectedId(null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Header title="여행계획" onBack={() => navigate(-1)} />
        <div className={styles.toolbar}>
          <DaySelector days={plan.days} selectedIndex={dayIndex} onSelect={selectDay} />
          {hasPlanB && (
            <button
              type="button"
              className={isPlanBVisible ? styles.planBToggleOn : styles.planBToggle}
              aria-pressed={isPlanBVisible}
              onClick={() => setIsPlanBVisible((visible) => !visible)}
            >
              플랜B 같이 보기
            </button>
          )}
        </div>
      </div>

      <div className={styles.mapArea}>
        <MapView
          className={styles.map}
          center={mapCenter}
          nodes={mapNodes}
          selectedNodeId={selectedId}
          route={route}
          onSelectNode={setSelectedId}
          onClickMap={() => setSelectedId(null)}
        />

        <section className={styles.sheet} aria-label={`${dayIndex + 1}일차 동선`}>
          <img src={handleIcon} alt="" className={styles.handle} />
          <div className={styles.sheetHeader}>
            <div>
              <h2 className={styles.sheetTitle}>
                {plan.destination ?? plan.title} {dayIndex + 1}일차
              </h2>
              <p className={styles.sheetDate}>
                {formatDayDate(day.date)}
                {day.zone ? ` · ${day.zone}` : ''}
              </p>
            </div>
            <button type="button" className={styles.editButton} onClick={() => navigate(editPath)}>
              <img src={editIcon} alt="" className={styles.editIcon} />
              <span className={styles.srOnly}>계획 수정</span>
            </button>
          </div>

          <div key={dayIndex} className={styles.sheetBody}>
            {stops.length > 0 ? (
              <DayTimeline stops={stops} isPlanBVisible={isPlanBVisible} />
            ) : (
              <div className={styles.empty}>
                <p className={styles.statusText}>이 날은 아직 정한 장소가 없어요.</p>
                <Button size="sm" variant="outline" isFullWidth={false} onClick={() => navigate(editPath)}>
                  장소 고르기
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
