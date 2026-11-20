import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import kebabIcon from "@/shared/assets/icons/kebab.svg";
import handleIcon from "@/shared/assets/icons/sheet-handle.svg";
import {
  createPlaces,
  placeKeys,
  type PlaceSearchResult,
} from "@/features/place/api/places";
import { getErrorMessage } from "@/shared/api/client";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import Header from "@/shared/components/Header";
import { LoadingSpinner } from "@/shared/components/Loading";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MapView,
} from "@/shared/components/Map";
import Toast from "@/shared/components/Toast";
import { CATEGORIES } from "@/features/place/lib/categories";
import {
  getFirstNodePosition,
  toMapNodes,
} from "@/features/place/lib/mapNodes";
import { usePlaces } from "@/features/place/model/usePlaces";
import type { Place, PlaceCategory } from "@/features/place/model/place.types";
import CategoryFilterBar from "@/features/place/ui/CategoryFilterBar";
import PlaceCardStrip from "@/features/place/ui/PlaceCardStrip";
import {
  COPY_DONE_MESSAGE,
  COPY_FAILED_MESSAGE,
  copyPlace,
  openPlace,
  SOURCE_MISSING_MESSAGE,
} from "@/features/place/lib/placeActions";
import {
  getDayZone,
  isPlaceInZone,
  type PlanZone,
} from "@/features/plan/lib/planZones";
import { mergePlanPlaces } from "@/features/plan/model/planPlaces";
import {
  completePlanDay,
  formatDayDate,
  withDraftIfEmptyDay,
} from "@/features/plan/model/planDays";
import {
  addNodeToDay,
  buildPlanningRoute,
  canSetPlanB,
  findOtherDayNumber,
  moveNodeToDay,
  removeNodeFromDay,
  setAccommodation,
  setDayZone,
  setPlanB,
} from "@/features/plan/model/planEdit";
import type { Plan } from "@/features/plan/model/plan.types";
import {
  useCreateAiDraft,
  usePlan,
  useUpdatePlan,
} from "@/features/plan/model/usePlan";
import DaySelector from "@/features/plan/ui/DaySelector";
import ZoneSheet from "@/features/plan/ui/ZoneSheet";
import {
  PlanTutorialCardFocus,
  PlanTutorialHint,
  PlanTutorialOverlay,
} from "@/features/plan/ui/PlanTutorial";
import {
  hasSeenPlanTutorial,
  markPlanTutorialSeen,
} from "@/features/plan/lib/planTutorialSeen";
import styles from "./PlanEditPage.module.css";

/** lodging: 숙소 선택 / zone: 일자별 구역 선택 / nodes: 지도에서 노드 확정 (기능명세서 4-3) */
type EditStep = "lodging" | "zone" | "nodes";

const STEP_TITLES: Record<EditStep, string> = {
  lodging: "숙소 선택하기",
  zone: "여행지역 선택",
  nodes: "여행계획",
};

const TOAST_MS = 2000;

const isOnMap = (place: Place) => toMapNodes([place]).length > 0;

export default function PlanEditPage() {
  const { planId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { plan, viewStatus, error, refetch } = usePlan(planId);
  const { places: libraryPlaces, viewStatus: placesStatus } = usePlaces();
  // 공유받은 계획의 카드는 내 보관함에 없어서 계획 응답에 든 카드로 채워요
  const places = mergePlanPlaces(libraryPlaces, plan);
  const updatePlan = useUpdatePlan(planId);
  const aiDraft = useCreateAiDraft(planId);

  // 구역을 정한 적 있는 계획은 해당 일차의 동선부터 보여줘요.
  const [step, setStep] = useState<EditStep | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingZone, setPendingZone] = useState<PlanZone | null>();
  const [zoneError, setZoneError] = useState<string | null>(null);
  /** 플랜B를 붙일 확정 노드의 카드 id. 있으면 지도에서 대신 갈 곳을 고르는 중이에요 */
  const [planBTargetId, setPlanBTargetId] = useState<string | null>(null);
  const [otherDayConfirm, setOtherDayConfirm] = useState<{
    placeId: string;
    dayNumber: number;
  } | null>(null);
  const [isSkipDayOpen, setIsSkipDayOpen] = useState(false);
  const [isAiDraftConfirmOpen, setIsAiDraftConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isConfirmTutorialClosed, setIsConfirmTutorialClosed] = useState(() =>
    hasSeenPlanTutorial("confirm"),
  );
  const closeConfirmTutorial = () => {
    markPlanTutorialSeen("confirm");
    setIsConfirmTutorialClosed(true);
  };
  const [isPlanBTutorialClosed, setIsPlanBTutorialClosed] = useState(() =>
    hasSeenPlanTutorial("planB"),
  );
  const closePlanBTutorial = () => {
    markPlanTutorialSeen("planB");
    setIsPlanBTutorialClosed(true);
  };
  const [hasFinishedPlan, setHasFinishedPlan] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSearchingLodging, setIsSearchingLodging] = useState(false);
  const [lodgingResult, setLodgingResult] = useState<PlaceSearchResult>();
  const [createdLodging, setCreatedLodging] = useState<{
    googlePlaceId: string;
    placeId: string;
  }>();
  const menuRef = useRef<HTMLDivElement>(null);
  const createLodging = useMutation({
    mutationFn: async (result: PlaceSearchResult) => {
      const created = await createPlaces([
        {
          category: "STAY",
          name: result.name,
          address: result.address,
          latitude: result.latitude,
          longitude: result.longitude,
          googlePlaceId: result.googlePlaceId,
        },
      ]);
      const [placeId] = created.placeIds;
      if (!placeId) throw new Error("숙소 카드를 저장하지 못했어요.");
      await queryClient.invalidateQueries({ queryKey: placeKeys.all });
      return placeId;
    },
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const continuingRef = useRef(false);
  const saveAttempt = useRef(0);
  const failedSave = useRef<{ plan: Plan; onSaved?: () => void } | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node))
        setIsMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  if (viewStatus === "loading") {
    return (
      <main className={styles.center}>
        <LoadingSpinner label="여행 계획을 불러오는 중" />
      </main>
    );
  }

  if (viewStatus === "error" || !plan) {
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

  const currentStep = step ?? (plan.days[0]?.zone ? "nodes" : "zone");
  const hasExistingRoute = plan.days.some(
    (planDay) => planDay.nodes.length > 0,
  );
  const day = plan.days[dayIndex] ?? plan.days[0];
  const dayLabel = `${dayIndex + 1}일차 · ${formatDayDate(day.date).replace(" (", "(")}`;
  const isLastDay = dayIndex === plan.days.length - 1;

  const save = async (nextPlan: Plan, onSaved?: () => void) => {
    if (continuingRef.current) return;
    const attempt = ++saveAttempt.current;
    if (onSaved) {
      continuingRef.current = true;
      setIsContinuing(true);
    }
    failedSave.current = null;
    setSaveError(null);
    try {
      await updatePlan.mutateAsync(nextPlan);
      if (attempt === saveAttempt.current) {
        failedSave.current = null;
        setSaveError(null);
        onSaved?.();
      }
    } catch (error) {
      if (attempt === saveAttempt.current) {
        failedSave.current = { plan: nextPlan, onSaved };
        setSaveError(getErrorMessage(error));
      }
    } finally {
      if (onSaved) {
        continuingRef.current = false;
        setIsContinuing(false);
      }
    }
  };

  const resetSelection = () => {
    setSelectedId(null);
    setPlanBTargetId(null);
    setIsPreviewing(false);
  };

  const goToStep = (nextStep: EditStep, nextDayIndex = dayIndex) => {
    resetSelection();
    setIsMenuOpen(false);
    setIsSearchingLodging(false);
    setLodgingResult(undefined);
    createLodging.reset();
    setDayIndex(nextDayIndex);
    setStep(nextStep);
    if (nextStep !== "nodes") {
      setIsReviewing(false);
      setHasFinishedPlan(false);
    }
    setCategory("all");
    setZoneError(null);
    setPendingZone(getDayZone(plan.days[nextDayIndex]));
  };

  const goToDay = (nextDayIndex: number) =>
    goToStep(plan.days[nextDayIndex]?.zone ? "nodes" : "zone", nextDayIndex);

  const handleBack = () => {
    if (continuingRef.current || createLodging.isPending) return;
    if (isPreviewing) return setIsPreviewing(false);
    // 플랜 B를 고르는 중에 다른 장소를 봤다면 선택만 풀고 플랜 B 고르기는 이어가요
    if (selectedId) return browsePlace(null);
    if (planBTargetId) return resetSelection();
    if (currentStep === "lodging") {
      if (lodgingResult) return setLodgingResult(undefined);
      if (isSearchingLodging) return setIsSearchingLodging(false);
      return goToDay(dayIndex);
    }
    if (isReviewing) {
      setIsReviewing(false);
      setHasFinishedPlan(false);
      return;
    }
    if (currentStep === "nodes") return goToStep("zone");
    if (currentStep === "zone" && dayIndex > 0) return goToDay(dayIndex - 1);
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    if (returnTo === "plans") navigate("/plans", { replace: true });
    else if (location.key === "default") navigate("/plans", { replace: true });
    else navigate(-1);
  };

  // ── 화면에 올릴 장소 ──
  const lodgingPlaces = places.filter(
    (place) => place.category === "accommodation" && isOnMap(place),
  );
  const lodgingPlace = places.find(
    (place) => place.id === plan.accommodationPlaceId,
  );
  const dayZone = getDayZone(day);
  const selectedZone =
    pendingZone === undefined ? dayZone : (pendingZone ?? undefined);
  const dayPlaceIds = new Set(
    day.nodes.flatMap((node) => [
      node.placeId,
      ...(node.planB ? [node.planB.placeId] : []),
    ]),
  );

  const getVisiblePlaces = (): Place[] => {
    if (currentStep === "lodging") return lodgingPlaces;
    const zone = currentStep === "zone" ? selectedZone : dayZone;
    const zonePlaces = zone
      ? places.filter((place) => isOnMap(place) && isPlaceInZone(place, zone))
      : [];
    if (currentStep === "zone") return zonePlaces;
    // 지도 위에서 참조할 수 있도록 다른 종류의 장소도 작은 점으로 남겨요.
    const pinned = places.filter(
      (place) => dayPlaceIds.has(place.id) || place.id === lodgingPlace?.id,
    );
    return [
      ...new Map(
        [...pinned, ...zonePlaces].map((place) => [place.id, place]),
      ).values(),
    ].filter(isOnMap);
  };

  const visiblePlaces = getVisiblePlaces();
  const lodgingResultPosition = lodgingResult && {
    lat: lodgingResult.latitude,
    lng: lodgingResult.longitude,
  };
  const selectedPlace = visiblePlaces.find((place) => place.id === selectedId);
  const selectedNode = day.nodes.find((node) => node.placeId === selectedId);
  const isSelectedLodging =
    currentStep === "nodes" &&
    selectedId !== null &&
    selectedId === plan.accommodationPlaceId;
  const planBTargetIndex = day.nodes.findIndex(
    (node) => node.placeId === planBTargetId,
  );
  // 숙소는 번호를 매기지 않아요. 안내문·버튼·토스트가 같은 번호를 쓰고, 첫 장소가 1번이에요
  const planBStopNumber = planBTargetIndex + 1;
  const planBTargetPlace = places.find((place) => place.id === planBTargetId);
  const canPreviewPlace =
    currentStep === "nodes" &&
    selectedPlace &&
    !isSelectedLodging &&
    !dayPlaceIds.has(selectedPlace.id);
  const canPreviewPlanB = Boolean(
    canPreviewPlace &&
    selectedPlace &&
    findOtherDayNumber(plan, dayIndex, selectedPlace.id) === undefined,
  );
  const canSavePlanB =
    selectedPlace &&
    planBTargetPlace &&
    canSetPlanB(plan, dayIndex, planBTargetPlace, selectedPlace);
  const route =
    currentStep === "nodes"
      ? buildPlanningRoute(plan, dayIndex, {
          previewPlaceId:
            isPreviewing && canPreviewPlace && !planBTargetId
              ? selectedPlace.id
              : undefined,
          previewPlanB:
            selectedPlace && canPreviewPlanB && planBTargetId
              ? { targetPlaceId: planBTargetId, placeId: selectedPlace.id }
              : undefined,
          isClosed: hasFinishedPlan,
        })
      : undefined;
  const getSearchedLodgingPhoto = (result: PlaceSearchResult) =>
    lodgingPlaces.find(
      (place) => place.imageUrl && place.googlePlaceId === result.googlePlaceId,
    )?.imageUrl ??
    lodgingPlaces.find(
      (place) =>
        place.imageUrl &&
        !place.googlePlaceId &&
        place.name === result.name &&
        place.location?.lat === result.latitude &&
        place.location.lng === result.longitude,
    )?.imageUrl ??
    "";
  const mapNodes =
    lodgingResult && lodgingResultPosition
      ? [
          {
            id: lodgingResult.googlePlaceId,
            name: lodgingResult.name,
            imageUrl: getSearchedLodgingPhoto(lodgingResult),
            position: lodgingResultPosition,
            googlePlaceId: lodgingResult.googlePlaceId,
          },
        ]
      : toMapNodes(visiblePlaces).map((node) => {
          const place = visiblePlaces.find((item) => item.id === node.id);
          const isPinned =
            dayPlaceIds.has(node.id) || node.id === lodgingPlace?.id;
          const isCategoryMatch =
            category === "all" || place?.category === category;
          const isDot =
            currentStep === "zone" ||
            (currentStep === "nodes" && !isPinned && !isCategoryMatch);
          return {
            ...node,
            isDot,
            categoryIcon:
              currentStep === "nodes" &&
              !isPinned &&
              !(
                (isPreviewing || (canPreviewPlanB && planBTargetId)) &&
                selectedId === node.id
              )
                ? place && CATEGORIES[place.category].icon?.src
                : undefined,
            isMuted:
              currentStep === "nodes" &&
              !isPinned &&
              findOtherDayNumber(plan, dayIndex, node.id) !== undefined,
          };
        });

  const zoneCenter = (
    currentStep === "zone" ? (selectedZone ?? dayZone) : dayZone
  )?.center;
  const mapCenter =
    lodgingResultPosition ??
    zoneCenter ??
    lodgingPlace?.location ??
    getFirstNodePosition(visiblePlaces) ??
    getFirstNodePosition(places) ??
    DEFAULT_MAP_CENTER;

  const browsePlace = (placeId: string | null) => {
    setIsPreviewing(false);
    setSelectedId(placeId);
  };

  const selectPlace = (placeId: string) => {
    if (currentStep === "zone" || lodgingResult || isReviewing) return;
    const place = visiblePlaces.find((item) => item.id === placeId);
    if (!place) return;
    if (
      currentStep === "nodes" &&
      category !== "all" &&
      place.category !== category &&
      !dayPlaceIds.has(placeId) &&
      placeId !== lodgingPlace?.id
    ) {
      setCategory(place.category);
    }
    if (
      selectedId === placeId &&
      !isPreviewing &&
      (currentStep === "lodging" ||
        (planBTargetId ? canPreviewPlanB : canPreviewPlace))
    ) {
      setIsPreviewing(true);
      return;
    }
    browsePlace(placeId);
  };

  // ── 숙소 ──
  const confirmLodging = (placeId: string) => {
    void save(setAccommodation(plan, placeId), () => goToDay(dayIndex));
  };

  const confirmSearchedLodging = async () => {
    if (!lodgingResult || createLodging.isPending) return;
    if (createdLodging?.googlePlaceId === lodgingResult.googlePlaceId) {
      confirmLodging(createdLodging.placeId);
      return;
    }
    try {
      const placeId = await createLodging.mutateAsync(lodgingResult);
      setCreatedLodging({
        googlePlaceId: lodgingResult.googlePlaceId,
        placeId,
      });
      confirmLodging(placeId);
    } catch {
      // 선택한 결과를 유지해 다시 저장할 수 있게 해요.
    }
  };

  // ── 구역 ──
  const confirmZone = () => {
    const zone = selectedZone;
    if (!zone) return;
    const hasPlaces = places.some(
      (place) => isOnMap(place) && isPlaceInZone(place, zone),
    );
    if (!hasPlaces) {
      setZoneError(
        `${zone.name} 주변에는 저장한 장소가 없어요. 다른 구역을 입력하거나, 직접 추가해 보세요.`,
      );
      return;
    }
    void save(setDayZone(plan, dayIndex, zone), () => goToStep("nodes"));
  };

  // ── 노드 ──
  const addPlace = (placeId: string) => {
    void save(addNodeToDay(plan, dayIndex, placeId), () =>
      setIsPreviewing(false),
    );
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

  /**
   * 확정한 카드 사진 위에 올리는 [플랜 B추가]·휴지통 (피그마 'S4-5c-2 카드 확정 후').
   * 플랜 B를 고르는 중에도 원래 동선의 장소를 빼거나 다른 장소의 플랜 B로 바꿀 수 있어요
   */
  const getNodeActions = (place: Place) => {
    if (currentStep !== "nodes") return undefined;
    const node = day.nodes.find((item) => item.placeId === place.id);
    if (!node) return undefined;
    return {
      planBLabel: node.planB ? "플랜 B변경" : "플랜 B추가",
      onPlanB: () => {
        closePlanBTutorial();
        setPlanBTargetId(node.placeId);
        setCategory(place.category);
        browsePlace(null);
      },
      onRemove: () => {
        closePlanBTutorial();
        void save(removeNodeFromDay(plan, dayIndex, node.placeId));
        if (node.placeId === planBTargetId) resetSelection();
        else browsePlace(null);
      },
    };
  };

  const addPlanB = () => {
    if (!planBTargetId || !selectedId || !canSavePlanB) return;
    void save(setPlanB(plan, dayIndex, planBTargetId, selectedId), () => {
      setToastMessage(`${planBStopNumber}번 장소의 플랜 B를 정했어요.`);
      resetSelection();
    });
  };

  const completeDay = () => {
    setIsSkipDayOpen(false);
    if (isLastDay) {
      resetSelection();
      setIsReviewing(true);
      return;
    }
    void save(completePlanDay(plan, dayIndex), () => goToDay(dayIndex + 1));
  };

  const isBusy = isContinuing || aiDraft.isPending || createLodging.isPending;

  const handleCompleteDay = () => {
    if (day.nodes.length === 0) setIsSkipDayOpen(true);
    else completeDay();
  };

  const actions = () => {
    if (currentStep === "lodging") {
      if (lodgingResult) {
        return (
          <Button
            disabled={createLodging.isPending || Boolean(saveError)}
            onClick={confirmSearchedLodging}
          >
            이 숙소로 선택
          </Button>
        );
      }
      if (selectedPlace && isPreviewing) {
        return (
          <Button onClick={() => confirmLodging(selectedPlace.id)}>
            이 숙소로 선택
          </Button>
        );
      }
      if (isSearchingLodging || selectedPlace) return null;
      return (
        <Button onClick={() => setIsSearchingLodging(true)}>
          숙소 직접 추가
        </Button>
      );
    }
    if (currentStep === "zone") {
      return (
        <Button aria-disabled={!selectedZone} onClick={confirmZone}>
          다음
        </Button>
      );
    }
    if (isPreviewing && planBTargetId) {
      return (
        <Button
          disabled={!canSavePlanB || Boolean(saveError)}
          onClick={addPlanB}
        >
          {planBStopNumber}번 장소의 플랜 B로 추가
        </Button>
      );
    }
    if (isPreviewing && canPreviewPlace) {
      return (
        <Button
          disabled={Boolean(saveError)}
          onClick={() => {
            closeConfirmTutorial();
            confirmSelectedPlace();
          }}
        >
          이 장소로 확정
        </Button>
      );
    }
    if (selectedPlace && !isSelectedLodging) return null;
    if (planBTargetId)
      return (
        <Button variant="outline" onClick={resetSelection}>
          취소
        </Button>
      );
    if (isReviewing) {
      return hasFinishedPlan ? (
        <Button
          onClick={() =>
            navigate(`/plans/${plan.id}`, {
              replace: true,
              state: { dayIndex, category },
            })
          }
        >
          여행계획 보기
        </Button>
      ) : (
        <Button
          onClick={() => {
            void save(completePlanDay(plan, plan.days.length - 1), () =>
              setHasFinishedPlan(true),
            );
          }}
        >
          여행계획 완성
        </Button>
      );
    }
    return (
      <Button disabled={day.nodes.length === 0} onClick={handleCompleteDay}>
        {dayIndex + 1}일차 완성
      </Button>
    );
  };

  const isStripVisible =
    selectedPlace &&
    !isSelectedLodging &&
    (!isPreviewing || (!canPreviewPlace && currentStep === "nodes"));
  const stripPlaces =
    currentStep === "lodging"
      ? lodgingPlaces
      : selectedNode
        ? [selectedPlace].filter((place): place is Place => Boolean(place))
        : visiblePlaces.filter(
            (place) =>
              place.id !== lodgingPlace?.id &&
              (category === "all" || place.category === category),
          );
  const lodgingAddress = lodgingResult?.address ?? selectedPlace?.address;
  const isLodgingConfirmation =
    currentStep === "lodging" &&
    (lodgingResult || (selectedPlace && isPreviewing));
  const footerAction = actions();
  const isConfirmTutorialOpen =
    !isConfirmTutorialClosed &&
    isPreviewing &&
    canPreviewPlace &&
    !planBTargetId &&
    currentStep === "nodes";
  const isPlanBTutorialOpen =
    !isPlanBTutorialClosed &&
    !isConfirmTutorialOpen &&
    currentStep === "nodes" &&
    !planBTargetId &&
    Boolean(isStripVisible && selectedNode);

  return (
    <main className={styles.page}>
      {isConfirmTutorialOpen && (
        <PlanTutorialOverlay kind="confirm" onClose={closeConfirmTutorial} />
      )}
      {isPlanBTutorialOpen && (
        <PlanTutorialOverlay kind="planB" onClose={closePlanBTutorial} />
      )}
      <div className={styles.top} inert={isBusy}>
        <Header
          title={STEP_TITLES[currentStep]}
          onBack={handleBack}
          action={
            <div ref={menuRef} className={styles.menuWrap}>
              <button
                type="button"
                className={styles.moreButton}
                aria-label="더보기"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <img src={kebabIcon} alt="" />
              </button>
              {isMenuOpen && (
                <div className={styles.menu}>
                  {currentStep !== "lodging" && (
                    <button type="button" onClick={() => goToStep("lodging")}>
                      숙소 선택하기
                    </button>
                  )}
                  {currentStep === "lodging" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          resetSelection();
                          setLodgingResult(undefined);
                          setIsMenuOpen(false);
                          setIsSearchingLodging(true);
                        }}
                      >
                        숙소 직접 추가
                      </button>
                      {plan.accommodationPlaceId && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            void save(setAccommodation(plan, undefined), () =>
                              goToDay(dayIndex),
                            );
                          }}
                        >
                          숙소 없이 시작
                        </button>
                      )}
                    </>
                  )}
                  {currentStep === "nodes" && (
                    <>
                      <button type="button" onClick={() => goToStep("zone")}>
                        여행지역 다시 선택
                      </button>
                      {!isReviewing && day.nodes.length === 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleCompleteDay();
                          }}
                        >
                          일차 건너뛰기
                        </button>
                      )}
                    </>
                  )}
                  {hasExistingRoute && (
                    <button
                      type="button"
                      disabled={updatePlan.isSaving}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAiDraftConfirmOpen(true);
                      }}
                    >
                      AI 초안으로 다시 만들기
                    </button>
                  )}
                </div>
              )}
            </div>
          }
        />
        {currentStep !== "lodging" && (
          <div className={styles.toolbar}>
            <DaySelector
              days={plan.days}
              selectedIndex={dayIndex}
              onSelect={goToDay}
            />
            {currentStep === "nodes" && (
              <div className={styles.filter}>
                <CategoryFilterBar
                  selected={category}
                  onChange={(next) => {
                    setCategory(next);
                    browsePlace(null);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.mapArea} inert={isBusy}>
        <MapView
          className={styles.map}
          center={mapCenter}
          // 구역 안에서는 카드가 몰려 있어 마커가 겹쳐요. 한 단계 확대해 덜 겹치게 해요
          zoom={
            currentStep === "lodging" ? DEFAULT_MAP_ZOOM : DEFAULT_MAP_ZOOM + 1
          }
          nodes={mapNodes}
          selectedNodeId={lodgingResult?.googlePlaceId ?? selectedId}
          route={route}
          isPlanning
          highlightedNodeId={
            hasFinishedPlan
              ? day.nodes.at(-1)?.placeId
              : isPreviewing
                ? selectedId
                : lodgingResult?.googlePlaceId
          }
          enlargeSelectedNode={Boolean(isLodgingConfirmation)}
          onSelectNode={selectPlace}
          onClickMap={() => {
            if (!lodgingResult) browsePlace(null);
          }}
        />
        {zoneError && currentStep === "zone" && (
          <p className={styles.errorBanner} role="alert">
            {zoneError}
          </p>
        )}
        {planBTargetId && !selectedPlace && (
          <p className={styles.notice}>
            {planBStopNumber}번 장소 대신 갈 곳을 지도에서 골라 주세요.
          </p>
        )}
        {planBTargetId && selectedPlace && canPreviewPlanB && !canSavePlanB && (
          <p className={styles.notice}>
            플랜 B는 같은 종류의 장소만 넣을 수 있어요.
          </p>
        )}
        {placesStatus === "loading" && (
          <div className={styles.placesLoading}>
            <LoadingSpinner label="장소를 불러오는 중" />
          </div>
        )}
      </div>

      <div
        className={`${styles.bottom} ${isConfirmTutorialOpen || isPlanBTutorialOpen ? styles.aboveTutorial : ""}`}
        inert={isBusy}
      >
        {saveError && (
          <div className={styles.saveError} role="alert">
            <p>저장하지 못했어요. {saveError}</p>
            <Button
              size="sm"
              variant="outline"
              disabled={updatePlan.isSaving}
              onClick={() => {
                const failed = failedSave.current;
                if (failed) void save(failed.plan, failed.onSaved);
              }}
            >
              다시 저장
            </Button>
          </div>
        )}
        {currentStep === "zone" && (
          <ZoneSheet
            key={dayIndex}
            dayLabel={dayLabel}
            destination={plan.destination}
            selectedZone={selectedZone}
            onEditQuery={() => {
              setPendingZone(null);
              setZoneError(null);
            }}
            onSelectZone={(zone) => {
              setPendingZone(zone);
              setZoneError(null);
            }}
          />
        )}
        {currentStep === "lodging" && isSearchingLodging && !lodgingResult && (
          <ZoneSheet
            dayLabel="숙소를 검색해주세요."
            destination={plan.destination}
            selectedZone={undefined}
            onSelectZone={(zone) => {
              browsePlace(null);
              setLodgingResult(zone.result);
            }}
            isLodging
          />
        )}
        {isLodgingConfirmation && (
          <section className={styles.lodgingSheet} aria-label="숙소 선택 확인">
            <img src={handleIcon} alt="" className={styles.handle} />
            <h2>이 숙소가 맞나요?</h2>
            <p>
              {lodgingAddress ?? lodgingResult?.name ?? selectedPlace?.name}
            </p>
            {createLodging.error && (
              <p role="alert">{getErrorMessage(createLodging.error)}</p>
            )}
          </section>
        )}
        {isStripVisible && (
          <div className={styles.strip}>
            {isPlanBTutorialOpen && <PlanTutorialHint kind="planB" />}
            <PlanTutorialCardFocus active={isPlanBTutorialOpen}>
              <PlaceCardStrip
                places={stripPlaces}
                selectedId={selectedId}
                onSelect={browsePlace}
                onPick={selectedNode ? undefined : selectPlace}
                isPlanCard
                isWide={Boolean(selectedNode)}
                onOpen={(place) => {
                  if (!openPlace(place))
                    setToastMessage(SOURCE_MISSING_MESSAGE);
                }}
                onCopy={async (place) =>
                  setToastMessage(
                    (await copyPlace(place))
                      ? COPY_DONE_MESSAGE
                      : COPY_FAILED_MESSAGE,
                  )
                }
                getNodeActions={getNodeActions}
              />
            </PlanTutorialCardFocus>
          </div>
        )}
        {footerAction && (
          <div className={styles.actions}>
            {isConfirmTutorialOpen && <PlanTutorialHint kind="confirm" />}
            {footerAction}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={otherDayConfirm !== null}
        icon="alert"
        title={`${otherDayConfirm?.dayNumber ?? ""}일차에 추가된 일정이에요.`}
        description="같은 장소는 한 번만 넣을 수 있어요. 이 일차로 옮길까요?"
        cancelLabel="아니요"
        confirmLabel="옮기기"
        onCancel={() => setOtherDayConfirm(null)}
        onConfirm={() => {
          if (otherDayConfirm) {
            // 옮기고 나서 원래 일차가 비면 계획은 다시 '작성 중'이 돼요
            void save(
              withDraftIfEmptyDay(
                moveNodeToDay(plan, dayIndex, otherDayConfirm.placeId),
              ),
              () => setIsPreviewing(false),
            );
          }
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
      {isContinuing && (
        <div className={styles.aiDraftLoading} role="status">
          <div>
            <LoadingSpinner label="여행 일정을 저장하는 중" />
            <p>저장이 끝나면 다음 화면으로 이동해요.</p>
          </div>
        </div>
      )}
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
            onSuccess: (draft) =>
              navigate(`/plans/${draft.id}`, { replace: true }),
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
