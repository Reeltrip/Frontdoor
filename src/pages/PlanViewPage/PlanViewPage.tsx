import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import Header from '@/shared/components/Header';
import { LoadingSpinner } from '@/shared/components/Loading';
import { DEFAULT_MAP_CENTER, type MapPosition } from '@/shared/components/Map';
import editIcon from '@/shared/assets/icons/edit-circle.svg';
import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import { toMapNodes } from '@/features/place/lib/mapNodes';
import { usePlaces } from '@/features/place/model/usePlaces';
import CategoryFilterBar from '@/features/place/ui/CategoryFilterBar';
import type { Place, PlaceCategory } from '@/features/place/model/place.types';
import { hasAuthTokens } from '@/shared/lib/authToken';
import { useSheetDrag } from '@/shared/hooks/useSheetDrag';
import { getDayZone } from '@/features/plan/lib/planZones';
import { mergePlanPlaces } from '@/features/plan/model/planPlaces';
import ShareSheet, { type ShareChannel } from '@/features/plan/ui/ShareSheet';
import kebabIcon from '@/shared/assets/icons/kebab.svg';
import { buildDayRoute } from '@/features/plan/model/planEdit';
import { useCreateShareLink, usePlan } from '@/features/plan/model/usePlan';
import type { ShareType } from '@/features/plan/model/plan.types';
import DaySelector from '@/features/plan/ui/DaySelector';
import DayRouteMap from '@/features/plan/ui/DayRouteMap';
import DayTimeline, { type TimelineStop } from '@/features/plan/ui/DayTimeline';
import styles from './PlanViewPage.module.css';

/** 아래 시트가 지도 아래쪽을 가려서, 동선 가운데보다 조금 남쪽을 지도 가운데로 잡아요 */
const SHEET_LAT_OFFSET = 0.004;

const DAY_FORMAT = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' });

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
  const entry = useLocation().state as { dayIndex?: number; category?: PlaceCategory | 'all' } | null;
  const { plan, viewStatus, error, refetch } = usePlan(planId);
  // 공유 링크(/plan/{id})는 로그인 없이도 열려요. 그때는 보관함을 부르지 않고 계획에 든 카드로 그려요
  const isLoggedIn = hasAuthTokens();
  const { places: libraryPlaces } = usePlaces({}, { isEnabled: isLoggedIn });
  const places = mergePlanPlaces(libraryPlaces, plan);
  const shareLink = useCreateShareLink(planId);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareType, setShareType] = useState<ShareType>('READ_ONLY');
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(entry?.dayIndex ?? 0);
  // 피그마 시트 높이 281px. 펼치면 지도를 위쪽 72px만 남겨요
  const sheet = useSheetDrag({ collapsedHeight: 281, topGap: 72 });
  const [category, setCategory] = useState<PlaceCategory | 'all'>(entry?.category ?? 'all');
  const [isPlanBVisible, setIsPlanBVisible] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥을 누르거나 Esc를 누르면 닫아요 (보관함 ⋮ 메뉴와 같은 방식)
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

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

  const dayIndex = Math.min(selectedDay, plan.days.length - 1);
  const day = plan.days[dayIndex];
  const placeById = new Map(places.map((place) => [place.id, place]));
  const lodging = plan.accommodationPlaceId ? placeById.get(plan.accommodationPlaceId) : undefined;
  const editPath = `/plans/${plan.id}/edit`;
  // 읽기 전용으로 공유받았거나 로그인하지 않았으면 고치지 못해요
  const canEdit = isLoggedIn && plan.role !== undefined && plan.role !== 'VIEWER';
  // 공유 링크는 계획을 만든 사람만 만들 수 있어요 (서버 규칙)
  const canShare = plan.role === 'OWNER';

  const share = (channel: ShareChannel) => {
    setShareMessage(null);
    shareLink.mutate(shareType, {
      onSuccess: async () => {
        // 받은 사람이 지금 보고 있는 이 사이트에서 열리게 현재 주소로 링크를 만들어요
        const url = `${window.location.origin}/plan/${plan.id}`;
        setSharedUrl(url);
        const label = shareType === 'EDIT' ? '함께 편집' : '읽기 전용';
        if (channel === 'message') {
          window.location.href = `sms:?&body=${encodeURIComponent(`${plan.title} ${url}`)}`;
          return;
        }
        if (channel === 'more' && typeof navigator.share === 'function') {
          // 공유 창을 닫으면 실패로 오는데, 그건 알릴 일이 아니에요
          await navigator.share({ title: plan.title, url }).catch(() => undefined);
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          setShareMessage(
            channel === 'instagram'
              ? `${label} 링크를 복사했어요. 인스타그램 메시지에 붙여넣어 보내 주세요.`
              : `${label} 링크를 복사했어요. 친구에게 붙여넣어 보내 주세요.`,
          );
        } catch {
          setShareMessage(`${label} 링크를 만들었어요. 아래 주소를 복사해 보내 주세요.`);
        }
      },
      onError: (shareError) => setShareMessage(getErrorMessage(shareError)),
    });
  };

  const openShare = () => {
    setIsMenuOpen(false);
    setSharedUrl(null);
    setShareMessage(null);
    setIsShareOpen(true);
  };

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
  const mainIds = new Set(route.map((stop) => stop.nodeId));
  const mapNodes = toMapNodes(places.filter((place) => routePlaceIds.has(place.id))).map((node) => ({
    ...node,
    isDot: !mainIds.has(node.id) && category !== 'all' && placeById.get(node.id)?.category !== category,
  }));
  const hasPlanB = day.nodes.some((node) => node.planB);

  const mapCenter = getRouteCenter(stops.map((stop) => stop.place)) ?? getDayZone(day)?.center ?? DEFAULT_MAP_CENTER;

  const selectDay = (nextIndex: number) => {
    setSelectedDay(nextIndex);
    setSelectedId(null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Header
          title="여행계획"
          onBack={() => (isLoggedIn ? navigate(-1) : navigate('/'))}
          action={
            // 고를 항목이 하나도 없으면(로그인하지 않은 공유 링크 등) ⋮ 자체를 숨겨요
            (canShare || canEdit || hasPlanB) && (
              <div ref={menuRef} className={styles.menuWrap}>
                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label="더보기"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                >
                  <img src={kebabIcon} alt="" />
                </button>
                {isMenuOpen && (
                  <div className={styles.menu} role="menu">
                    {canShare && (
                      <button type="button" role="menuitem" className={styles.menuItem} onClick={openShare}>
                        공유하기
                      </button>
                    )}
                    {hasPlanB && (
                      <button type="button" role="menuitem" className={styles.menuItem} onClick={() => {
                        setIsPlanBVisible((visible) => !visible);
                        setIsMenuOpen(false);
                      }}>
                        {isPlanBVisible ? '플랜 B 숨기기' : '플랜 B 같이 보기'}
                      </button>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.menuItem}
                        onClick={() => navigate(`/plans/${plan.id}/info`)}
                      >
                        계획 편집
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          }
        />
        <div className={styles.toolbar}>
          <DaySelector days={plan.days} selectedIndex={dayIndex} onSelect={selectDay} isCompact />
          <div className={styles.filter}>
            <CategoryFilterBar selected={category} onChange={setCategory} scrollToSelected />
          </div>
          {!isLoggedIn && (
            <button
              type="button"
              className={styles.signIn}
              onClick={() => navigate('/login', { state: { from: `/plan/${plan.id}` } })}
            >
              로그인하고 함께 보기
            </button>
          )}

        </div>
      </div>

      <div className={styles.mapArea}>
        <DayRouteMap
          stopPlaces={stops.map((stop) => stop.place)}
          date={day.date}
          canFetchRoutes={isLoggedIn}
          className={styles.map}
          center={mapCenter}
          nodes={mapNodes}
          selectedNodeId={selectedId}
          route={route}
          isPlanning
          onSelectNode={setSelectedId}
          onClickMap={() => setSelectedId(null)}
        />

        <section
          data-sheet
          className={[styles.sheet, sheet.isExpanded && styles.sheetExpanded, sheet.isDragging && styles.sheetDragging]
            .filter(Boolean)
            .join(' ')}
          style={sheet.sheetStyle}
          aria-label={`${dayIndex + 1}일차 동선`}
        >
          {/* 손잡이와 제목 줄을 끌면 시트가 펼쳐지고 접혀요. 누르기만 해도 바뀌어요 */}
          <div className={styles.sheetGrip} {...sheet.dragHandlers}>
            <button
              type="button"
              data-sheet-handle
              className={styles.handle}
              aria-expanded={sheet.isExpanded}
              aria-label={sheet.isExpanded ? '일정 접기' : '일정 펼치기'}
              // 손가락·마우스로 누른 건 끌기 처리에서 바꿔요. 키보드(detail 0)만 여기서 바꿔요
              onClick={(event) => { if (event.detail === 0) sheet.toggle(); }}
            >
              <img src={handleIcon} alt="" />
            </button>
            <div className={styles.sheetHeader}>
              <div>
                <h2 className={styles.sheetTitle}>
                  {plan.destination ?? plan.title} {dayIndex + 1}일차
                </h2>
                <p className={styles.sheetDate}>
                  {DAY_FORMAT.format(new Date(`${day.date}T00:00:00Z`))}
                </p>
              </div>
              {canEdit && (
                <button type="button" className={styles.editButton} onClick={() => navigate(editPath)}>
                  <img src={editIcon} alt="" className={styles.editIcon} />
                  <span className={styles.srOnly}>계획 수정</span>
                </button>
              )}
            </div>
          </div>

          <div key={dayIndex} className={styles.sheetBody}>
            {stops.length > 0 ? (
              <DayTimeline stops={stops} isPlanBVisible={isPlanBVisible} date={day.date} canFetchRoutes={isLoggedIn} />
            ) : (
              <div className={styles.empty}>
                <p className={styles.statusText}>이 날은 아직 정한 장소가 없어요.</p>
                {canEdit && (
                  <Button size="sm" variant="outline" isFullWidth={false} onClick={() => navigate(editPath)}>
                    장소 고르기
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {isShareOpen && (
        <ShareSheet
          shareType={shareType}
          onChangeShareType={(nextType) => {
            setShareType(nextType);
            setSharedUrl(null);
            setShareMessage(null);
          }}
          isPending={shareLink.isPending}
          sharedUrl={sharedUrl}
          message={shareMessage}
          onShare={share}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </main>
  );
}
