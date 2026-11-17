import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '@/shared/api/client';
import Button from '@/shared/components/Button';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Header from '@/shared/components/Header';
import { LoadingSpinner } from '@/shared/components/Loading';
import { DEFAULT_MAP_CENTER, MapView, type MapPosition } from '@/shared/components/Map';
import Toast from '@/shared/components/Toast';
import { toMapNodes } from '@/features/place/lib/mapNodes';
import { usePlaces } from '@/features/place/model/usePlaces';
import type { Place, PlaceCategory } from '@/features/place/model/place.types';
import CategoryFilterBar from '@/features/place/ui/CategoryFilterBar';
import PlaceCardStrip from '@/features/place/ui/PlaceCardStrip';
import { getDayZone, isPlaceInZone, type PlanZone } from '@/features/plan/lib/planZones';
import { mergePlanPlaces } from '@/features/plan/model/planPlaces';
import { finishPlan, formatDayDate } from '@/features/plan/model/planDays';
import {
  addNodeToDay,
  buildDayRoute,
  findOtherDayNumber,
  removeNodeFromDay,
  setAccommodation,
  setDayZone,
  setPlanB,
} from '@/features/plan/model/planEdit';
import type { Plan } from '@/features/plan/model/plan.types';
import { useCreateAiDraft, usePlan, useUpdatePlan } from '@/features/plan/model/usePlan';
import DaySelector from '@/features/plan/ui/DaySelector';
import ZoneSheet from '@/features/plan/ui/ZoneSheet';
import styles from './PlanEditPage.module.css';

/** lodging: 숙소 선택 / zone: 일자별 구역 선택 / nodes: 지도에서 노드 확정 (기능명세서 4-3) */
type EditStep = 'lodging' | 'zone' | 'nodes';

const STEP_TITLES: Record<EditStep, string> = {
  lodging: '숙소 선택하기',
  zone: '여행지역 선택',
  nodes: '여행계획',
};

const TOAST_MS = 2000;

/** 처음 들어왔을 때: 아직 아무것도 안 했으면 숙소부터, 아니면 1일차 */
const getInitialStep = (plan: Plan): EditStep => {
  const isUntouched = !plan.accommodationPlaceId && plan.days.every((day) => day.nodes.length === 0 && !day.zone);
  if (isUntouched) return 'lodging';
  return plan.days[0]?.zone ? 'nodes' : 'zone';
};

const isOnMap = (place: Place) => toMapNodes([place]).length > 0;

export default function PlanEditPage() {
  const { planId = '' } = useParams();
  const navigate = useNavigate();
  const { plan, viewStatus, error, refetch } = usePlan(planId);
  const { places: libraryPlaces, viewStatus: placesStatus } = usePlaces();
  // 공유받은 계획의 카드는 내 보관함에 없어서 계획 응답에 든 카드로 채워요
  const places = mergePlanPlaces(libraryPlaces, plan);
  const updatePlan = useUpdatePlan(planId);
  const aiDraft = useCreateAiDraft(planId);

  // null이면 계획을 보고 정해요 (불러오기 전에는 알 수 없어서)
  const [step, setStep] = useState<EditStep | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [category, setCategory] = useState<PlaceCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerOverride, setCenterOverride] = useState<MapPosition | null>(null);
  const [pendingZone, setPendingZone] = useState<PlanZone | undefined>();
  const [zoneError, setZoneError] = useState<string | null>(null);
  /** 플랜B를 붙일 확정 노드 id. 있으면 지도에서 대신 갈 곳을 고르는 중이에요 */
  const [planBTargetId, setPlanBTargetId] = useState<string | null>(null);
  const [otherDayConfirm, setOtherDayConfirm] = useState<{ placeId: string; dayNumber: number } | null>(null);
  const [isSkipDayOpen, setIsSkipDayOpen] = useState(false);
  const [isAiDraftConfirmOpen, setIsAiDraftConfirmOpen] = useState(false);
  const [isNoLodgingDismissed, setIsNoLodgingDismissed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

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

  const currentStep = step ?? getInitialStep(plan);
  const hasExistingRoute = plan.days.some((planDay) => planDay.nodes.length > 0);
  const day = plan.days[dayIndex] ?? plan.days[0];
  const dayLabel = `${dayIndex + 1}일차 · ${formatDayDate(day.date)}`;
  const isLastDay = dayIndex === plan.days.length - 1;
  const isPlacesLoaded = placesStatus === 'success' || placesStatus === 'empty';

  const save = (nextPlan: Plan) =>
    updatePlan.mutate(nextPlan, {
      onError: (saveError) => setToastMessage(`저장하지 못했어요. ${getErrorMessage(saveError)}`),
    });

  const resetSelection = () => {
    setSelectedId(null);
    setPlanBTargetId(null);
    setCenterOverride(null);
  };

  const goToStep = (nextStep: EditStep, nextDayIndex = dayIndex) => {
    resetSelection();
    setDayIndex(nextDayIndex);
    setStep(nextStep);
    setCategory('all');
    setZoneError(null);
    setPendingZone(getDayZone(plan.days[nextDayIndex]));
  };

  const goToDay = (nextDayIndex: number) =>
    goToStep(plan.days[nextDayIndex]?.zone ? 'nodes' : 'zone', nextDayIndex);

  const handleBack = () => {
    if (currentStep === 'nodes') return goToStep('zone');
    if (currentStep === 'zone' && dayIndex > 0) return goToStep('nodes', dayIndex - 1);
    if (currentStep === 'zone') return goToStep('lodging');
    navigate(-1);
  };

  // ── 화면에 올릴 장소 ──
  const lodgingPlaces = places.filter((place) => place.category === 'accommodation' && isOnMap(place));
  const lodgingPlace = places.find((place) => place.id === plan.accommodationPlaceId);
  const dayZone = getDayZone(day);
  const dayPlaceIds = new Set(day.nodes.flatMap((node) => [node.placeId, ...(node.planB ? [node.planB.placeId] : [])]));

  const getVisiblePlaces = (): Place[] => {
    if (currentStep === 'lodging') return lodgingPlaces;
    const zone = currentStep === 'zone' ? pendingZone : dayZone;
    const zonePlaces = zone ? places.filter((place) => isOnMap(place) && isPlaceInZone(place, zone)) : [];
    if (currentStep === 'zone') return zonePlaces;

    const filtered = zonePlaces.filter((place) => category === 'all' || place.category === category);
    // 확정한 노드와 숙소는 필터와 상관없이 늘 보여야 동선이 끊기지 않아요
    const pinned = places.filter((place) => dayPlaceIds.has(place.id) || place.id === lodgingPlace?.id);
    return [...new Map([...pinned, ...filtered].map((place) => [place.id, place])).values()].filter(isOnMap);
  };

  const visiblePlaces = getVisiblePlaces();
  const mapNodes = toMapNodes(visiblePlaces).map((node) => ({
    ...node,
    isMuted:
      currentStep === 'nodes' && !dayPlaceIds.has(node.id) && findOtherDayNumber(plan, dayIndex, node.id) !== undefined,
  }));
  const route = currentStep === 'nodes' ? buildDayRoute(plan, dayIndex) : undefined;

  const zoneCenter = (currentStep === 'zone' ? pendingZone : dayZone)?.center;
  const mapCenter = centerOverride ?? zoneCenter ?? lodgingPlace?.location ?? DEFAULT_MAP_CENTER;

  const selectedPlace = visiblePlaces.find((place) => place.id === selectedId);
  const selectedNode = day.nodes.find((node) => node.placeId === selectedId);
  const isSelectedLodging = selectedId !== null && selectedId === plan.accommodationPlaceId;
  const planBTargetIndex = day.nodes.findIndex((node) => node.id === planBTargetId);

  const selectPlace = (placeId: string) => {
    if (currentStep === 'zone') return;
    const place = visiblePlaces.find((item) => item.id === placeId);
    setSelectedId(placeId);
    if (place?.location) setCenterOverride(place.location);
  };

  // ── 숙소 ──
  const confirmLodging = (placeId: string | undefined) => {
    save(setAccommodation(plan, placeId));
    goToStep(plan.days[0]?.zone ? 'nodes' : 'zone', 0);
  };

  const isNoLodgingOpen =
    currentStep === 'lodging' && isPlacesLoaded && lodgingPlaces.length === 0 && !isNoLodgingDismissed;

  // ── 구역 ──
  const confirmZone = () => {
    if (!pendingZone) return;
    const hasPlaces = places.some((place) => isOnMap(place) && isPlaceInZone(place, pendingZone));
    if (!hasPlaces) {
      setZoneError(`${pendingZone.name} 주변에는 저장한 장소가 없어요. 다른 구역을 입력하거나, 직접 추가해 보세요.`);
      return;
    }
    save(setDayZone(plan, dayIndex, pendingZone));
    goToStep('nodes');
  };

  // ── 노드 ──
  const addPlace = (placeId: string) => {
    save(addNodeToDay(plan, dayIndex, placeId));
    setSelectedId(null);
  };

  const confirmSelectedPlace = () => {
    if (!selectedId) return;
    const dayNumber = findOtherDayNumber(plan, dayIndex, selectedId);
    if (dayNumber !== undefined) {
      setOtherDayConfirm({ placeId: selectedId, dayNumber });
      return;
    }
    addPlace(selectedId);
  };

  const removeSelectedPlace = () => {
    if (!selectedId) return;
    save(removeNodeFromDay(plan, dayIndex, selectedId));
    setSelectedId(null);
  };

  const addPlanB = () => {
    if (!planBTargetId || !selectedId) return;
    save(setPlanB(plan, dayIndex, planBTargetId, selectedId));
    setToastMessage(`${planBTargetIndex + 1}번 장소의 플랜 B를 정했어요.`);
    resetSelection();
  };

  const completeDay = () => {
    setIsSkipDayOpen(false);
    if (!isLastDay) {
      goToDay(dayIndex + 1);
      return;
    }
    save(finishPlan(plan));
    navigate(`/plans/${plan.id}`, { replace: true });
  };

  const handleCompleteDay = () => {
    if (day.nodes.length === 0) setIsSkipDayOpen(true);
    else completeDay();
  };

  // ── 아래쪽 버튼 ──
  const renderActions = () => {
    if (currentStep === 'lodging') {
      return (
        <>
          <Button disabled={!selectedPlace} onClick={() => confirmLodging(selectedId ?? undefined)}>
            이 숙소에서 출발
          </Button>
          <button type="button" className={styles.textButton} onClick={() => confirmLodging(undefined)}>
            숙소 없이 시작
          </button>
        </>
      );
    }

    if (currentStep === 'zone') {
      return (
        <Button disabled={!pendingZone} onClick={confirmZone}>
          다음
        </Button>
      );
    }

    if (planBTargetId) {
      const canAdd = selectedPlace && !dayPlaceIds.has(selectedPlace.id) && !isSelectedLodging;
      return (
        <>
          <Button disabled={!canAdd} onClick={addPlanB}>
            {planBTargetIndex + 1}번 장소의 플랜 B로 추가
          </Button>
          <button type="button" className={styles.textButton} onClick={resetSelection}>
            취소
          </button>
        </>
      );
    }

    if (selectedNode) {
      return (
        <>
          <Button
            onClick={() => {
              setPlanBTargetId(selectedNode.id);
              setSelectedId(null);
            }}
          >
            {selectedNode.planB ? '플랜 B 바꾸기' : '플랜 B 추가'}
          </Button>
          <button type="button" className={styles.textButton} onClick={removeSelectedPlace}>
            계획에서 제거
          </button>
        </>
      );
    }

    if (selectedPlace && !isSelectedLodging) {
      return <Button onClick={confirmSelectedPlace}>이 장소로 확정</Button>;
    }

    return <Button onClick={handleCompleteDay}>{dayIndex + 1}일차 완성</Button>;
  };

  const isEmptyCategory = currentStep === 'nodes' && isPlacesLoaded && mapNodes.length === 0;
  const isStripVisible = Boolean(selectedPlace) && !isSelectedLodging;

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Header title={STEP_TITLES[currentStep]} onBack={handleBack} />
        {hasExistingRoute && (
          <button type="button" className={styles.aiDraftButton} onClick={() => setIsAiDraftConfirmOpen(true)}>
            AI 초안으로 다시 만들기
          </button>
        )}
        {currentStep !== 'lodging' && (
          <div className={styles.toolbar}>
            <DaySelector days={plan.days} selectedIndex={dayIndex} onSelect={goToDay} />
            {currentStep === 'nodes' && (
              <div className={styles.filter}>
                <CategoryFilterBar
                  selected={category}
                  onChange={(next) => {
                    setCategory(next);
                    setSelectedId(null);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.mapArea}>
        <MapView
          className={styles.map}
          center={mapCenter}
          nodes={mapNodes}
          selectedNodeId={selectedId}
          route={route}
          onSelectNode={selectPlace}
          onClickMap={() => {
            if (!planBTargetId) setSelectedId(null);
          }}
        />
        {zoneError && currentStep === 'zone' && (
          <p className={styles.errorBanner} role="alert">
            {zoneError}
          </p>
        )}
        {planBTargetId && !selectedPlace && (
          <p className={styles.notice}>{planBTargetIndex + 1}번 장소 대신 갈 곳을 지도에서 골라 주세요.</p>
        )}
        {!planBTargetId && isEmptyCategory && (
          <p className={styles.notice}>이 구역에 해당하는 장소가 없어요.</p>
        )}
        {placesStatus === 'loading' && (
          <div className={styles.placesLoading}>
            <LoadingSpinner label="장소를 불러오는 중" />
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        {currentStep === 'zone' && (
          <ZoneSheet
            key={dayIndex}
            dayLabel={dayLabel}
            destination={plan.destination}
            selectedZone={pendingZone}
            onSelectZone={(zone) => {
              setPendingZone(zone);
              setZoneError(null);
              setCenterOverride(null);
            }}
          />
        )}
        {isStripVisible && (
          <div className={styles.strip}>
            <PlaceCardStrip
              places={visiblePlaces.filter((place) => place.id !== plan.accommodationPlaceId)}
              selectedId={selectedId}
              onSelect={selectPlace}
            />
          </div>
        )}
        <div className={styles.actions}>{renderActions()}</div>
      </div>

      <ConfirmModal
        isOpen={isNoLodgingOpen}
        icon="alert"
        title="숙소 위치가 어디인가요?"
        description="선택한 주소가 매일의 출발지, 도착지가 돼요."
        cancelLabel="건너뛰기"
        confirmLabel="추가하기"
        onCancel={() => {
          setIsNoLodgingDismissed(true);
          confirmLodging(undefined);
        }}
        onConfirm={() => navigate('/cards/new')}
      />
      <ConfirmModal
        isOpen={otherDayConfirm !== null}
        icon="alert"
        title={`${otherDayConfirm?.dayNumber ?? ''}일차에 추가된 일정이에요.`}
        description="이 일차에도 추가할까요?"
        cancelLabel="아니요"
        confirmLabel="추가하기"
        onCancel={() => setOtherDayConfirm(null)}
        onConfirm={() => {
          if (otherDayConfirm) addPlace(otherDayConfirm.placeId);
          setOtherDayConfirm(null);
        }}
      />
      <ConfirmModal
        isOpen={isSkipDayOpen}
        icon="alert"
        title="고른 장소 없이 넘어갈까요?"
        description="빈 일차가 있으면 작성 중인 계획에 보관돼요."
        cancelLabel="아니요"
        confirmLabel="넘어가기"
        onCancel={() => setIsSkipDayOpen(false)}
        onConfirm={completeDay}
      />
      {toastMessage && <Toast message={toastMessage} />}
      <ConfirmModal
        isOpen={isAiDraftConfirmOpen}
        icon="alert"
        title="AI 초안을 만들까요?"
        description="현재 계획의 모든 일자와 동선이 AI 초안으로 바뀌어요."
        cancelLabel="취소"
        confirmLabel="초안 만들기"
        onCancel={() => setIsAiDraftConfirmOpen(false)}
        onConfirm={() => {
          setIsAiDraftConfirmOpen(false);
          aiDraft.mutate(undefined, {
            onSuccess: (draft) => navigate(`/plans/${draft.id}`, { replace: true }),
            onError: (error) => setToastMessage(getErrorMessage(error)),
          });
        }}
      />
      {aiDraft.isPending && (
        <div className={styles.aiDraftLoading} role="status">
          <div>
            <LoadingSpinner label="AI가 여행 동선을 만드는 중" />
            <p>AI가 여행 동선을 짜고 있어요.</p>
            <span>보통 5~10초 정도 걸려요.</span>
          </div>
        </div>
      )}
    </main>
  );
}
