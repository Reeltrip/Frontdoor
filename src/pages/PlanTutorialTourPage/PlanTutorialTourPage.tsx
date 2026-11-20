import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import Header from "@/shared/components/Header";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MapView,
  type MapRouteStop,
} from "@/shared/components/Map";
import { usePlaces } from "@/features/place/model/usePlaces";
import type { Place } from "@/features/place/model/place.types";
import { toMapNodes } from "@/features/place/lib/mapNodes";
import PlaceCardStrip from "@/features/place/ui/PlaceCardStrip";
import {
  PlanTutorialCardFocus,
  PlanTutorialHint,
  PlanTutorialOverlay,
} from "@/features/plan/ui/PlanTutorial";
import {
  markPlanTutorialSeen,
  type PlanTutorialKind,
} from "@/features/plan/lib/planTutorialSeen";
import { clearTutorialReplay } from "@/features/account/lib/tutorialReplay";
// 실제 여행계획 편집 화면과 같은 자리에 버튼·카드가 오게 그 화면 스타일을 그대로 써요
import editStyles from "@/pages/PlanEditPage/PlanEditPage.module.css";
import styles from "./PlanTutorialTourPage.module.css";

/** 보관함이 비었을 때 쓰는 예시 카드. 지도에는 올리지 않아요 */
const SAMPLE_PLACE: Place = {
  id: "tutorial-sample",
  category: "food",
  name: "예시 장소",
  imageUrl: "",
  summary: [],
};

const squaredDistance = (a: Place, b: Place) =>
  a.location && b.location
    ? (a.location.lat - b.location.lat) ** 2 + (a.location.lng - b.location.lng) ** 2
    : Infinity;

/** 지도에 올릴 수 있는 카드 중 첫 장소와 그와 가장 가까운 장소. 두 장소가 한 화면에 들어오게 골라요 */
function pickTourPlaces(places: Place[]): [Place, Place | undefined] {
  const mappable = places.filter((place) => toMapNodes([place]).length > 0);
  const first = mappable[0] ?? places[0] ?? SAMPLE_PLACE;
  const nearest = mappable
    .filter((place) => place.id !== first.id)
    .sort((a, b) => squaredDistance(first, a) - squaredDistance(first, b))[0];
  return [first, nearest];
}

/**
 * 튜토리얼 다시 보기의 여행계획 단계 (#238).
 * 실제 계획 편집에서는 장소를 골라야 안내가 떠서, 보관함 카드로 같은 모양을 만들어 보여줘요.
 * 확정 안내(S4-5c-2) → 플랜 B 안내(S4-5c) → 마이페이지. 화면 아무 곳이나 누르면 다음으로 넘어가요
 */
export default function PlanTutorialTourPage() {
  const navigate = useNavigate();
  const { places, isLoaded } = usePlaces();
  const [kind, setKind] = useState<PlanTutorialKind>("confirm");
  const [confirmedPlace, previewPlace] = pickTourPlaces(places);

  const handleNext = () => {
    markPlanTutorialSeen(kind);
    if (kind === "confirm") {
      setKind("planB");
      return;
    }
    clearTutorialReplay();
    navigate("/my", { replace: true });
  };

  // 확정 안내: 1번은 확정됐고 2번을 둘러보는 중. 플랜 B 안내: 두 장소 다 확정했고 1번 카드를 고른 상태
  const isConfirm = kind === "confirm";
  const tourPlaces = [confirmedPlace, previewPlace].filter(
    (place): place is Place => Boolean(place),
  );
  const nodes = toMapNodes(tourPlaces);
  const route: MapRouteStop[] = nodes.map((node) => ({ nodeId: node.id }));
  const focusPlace = isConfirm ? (previewPlace ?? confirmedPlace) : confirmedPlace;

  return (
    <main className={editStyles.page}>
      <PlanTutorialOverlay kind={kind} onClose={handleNext} />
      <div className={editStyles.top}>
        <Header title="여행계획" />
      </div>
      <div className={editStyles.mapArea}>
        <MapView
          className={editStyles.map}
          center={nodes[0]?.position ?? DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM + 1}
          nodes={nodes}
          selectedNodeId={focusPlace.id}
          route={route}
          isPlanning
          highlightedNodeId={isConfirm ? focusPlace.id : undefined}
        />
      </div>

      {isLoaded && (
        <div className={`${editStyles.bottom} ${editStyles.aboveTutorial}`}>
          {isConfirm ? (
            // 실제 편집 화면도 장소를 둘러보는 중에는 카드 없이 확정 버튼만 보여줘요
            <div className={editStyles.actions}>
              <PlanTutorialHint kind="confirm" />
              <Button>이 장소로 확정</Button>
            </div>
          ) : (
            <div className={editStyles.strip}>
              <PlanTutorialHint kind="planB" />
              <PlanTutorialCardFocus active>
                <PlaceCardStrip
                  places={[focusPlace]}
                  selectedId={focusPlace.id}
                  onSelect={() => {}}
                  isPlanCard
                  isWide
                  getNodeActions={() => ({
                    planBLabel: "플랜 B추가",
                    onPlanB: () => {},
                    onRemove: () => {},
                  })}
                />
              </PlanTutorialCardFocus>
            </div>
          )}
        </div>
      )}

      {/* 막 위로 올라온 버튼·카드까지 덮어서, 어디를 눌러도 실제 동작 없이 다음 안내로 넘어가요 */}
      <button
        type="button"
        className={styles.nextCatcher}
        onClick={handleNext}
        aria-label={isConfirm ? "다음 안내 보기" : "안내 마치기"}
      />
    </main>
  );
}
