import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import checkIcon from "@/shared/assets/icons/dial-check.svg";
import editIcon from "@/shared/assets/icons/dial-edit.svg";
import Header from "@/shared/components/Header";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import PlaceCarousel from "@/features/place/ui/PlaceCarousel";
import ConfirmModal from "@/shared/components/ConfirmModal";
import Toast from "@/shared/components/Toast";
import PlaceEditCard from "@/features/place/ui/PlaceEditCard";
import {
  applyDraft,
  isDraftChanged,
  toDraft,
  type PlaceDraft,
} from "@/features/place/model/placeEdit";
import type { Place, PlaceCategory } from "@/features/place/model/place.types";
import { FAKE_PLACES_BY_CATEGORY } from "@/features/place/api/fakePlaces";
import {
  FAKE_RESULT_CATEGORIES,
  FAKE_RESULT_INITIAL_INDEX,
  FAKE_RESULT_REGION,
} from "@/features/place/api/fakeResult";
import styles from "./CardBrowsePage.module.css";

const TUTORIAL_SEEN_KEY = "reeltrip:dial-tutorial-seen";
const TOAST_DURATION_MS = 2000;

function hasSeenTutorial(): boolean {
  try {
    return sessionStorage.getItem(TUTORIAL_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markTutorialSeen() {
  try {
    sessionStorage.setItem(TUTORIAL_SEEN_KEY, "1");
  } catch {}
}

type CardBrowseState = { categoryIndex?: number };

function getInitialCategoryIndex(state: unknown): number {
  const { categoryIndex } = (state ?? {}) as CardBrowseState;
  if (
    typeof categoryIndex === "number" &&
    FAKE_RESULT_CATEGORIES[categoryIndex]
  )
    return categoryIndex;
  return FAKE_RESULT_INITIAL_INDEX;
}

export default function CardBrowsePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categoryIndex, setCategoryIndex] = useState(() =>
    getInitialCategoryIndex(location.state),
  );
  const [placeIndex, setPlaceIndex] = useState(0);
  const [isTutorialOpen, setIsTutorialOpen] = useState(
    () => !hasSeenTutorial(),
  );
  const [placesByCategory, setPlacesByCategory] = useState(
    FAKE_PLACES_BY_CATEGORY,
  );
  const [draft, setDraft] = useState<PlaceDraft | null>(null);
  const [pendingLeave, setPendingLeave] = useState<"exit" | "back" | null>(
    null,
  );
  const [isToastVisible, setIsToastVisible] = useState(false);

  const category = FAKE_RESULT_CATEGORIES[categoryIndex];
  const places = placesByCategory[category.category] ?? [];
  const activePlace: Place | undefined = places[placeIndex];
  const isEditing = draft !== null;
  const isChanged =
    activePlace !== undefined &&
    draft !== null &&
    isDraftChanged(activePlace, draft);

  useEffect(() => {
    if (!isToastVisible) return;
    const timer = window.setTimeout(
      () => setIsToastVisible(false),
      TOAST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isToastVisible]);

  const closeTutorial = () => {
    markTutorialSeen();
    setIsTutorialOpen(false);
  };

  const handleCategoryChange = (index: number) => {
    setCategoryIndex(index);
    setPlaceIndex(0);
    closeTutorial();
  };

  const savePlace = (
    categoryKey: PlaceCategory,
    place: Place,
    nextDraft: PlaceDraft,
  ) => {
    const saved = applyDraft(place, nextDraft);
    setPlacesByCategory((current) => ({
      ...current,
      [categoryKey]: (current[categoryKey] ?? []).map((item) =>
        item.id === saved.id ? saved : item,
      ),
    }));
    setIsToastVisible(true);
  };

  const handleEdit = () => {
    if (!isEditing) {
      if (activePlace) setDraft(toDraft(activePlace));
      return;
    }
    if (isChanged) setPendingLeave("exit");
    else setDraft(null);
  };

  const handleSave = () => {
    if (!activePlace || !draft) return;
    if (isChanged) savePlace(category.category, activePlace, draft);
    setDraft(null);
  };

  const handleBack = () => {
    if (isChanged) setPendingLeave("back");
    else navigate(-1);
  };

  const finishLeave = () => {
    const action = pendingLeave;
    setPendingLeave(null);
    setDraft(null);
    if (action === "back") navigate(-1);
  };

  const handleLeaveSave = () => {
    if (activePlace && draft) savePlace(category.category, activePlace, draft);
    finishLeave();
  };

  return (
    <main className={styles.page}>
      <Header title={FAKE_RESULT_REGION} onBack={handleBack} />

      <div className={styles.stage}>
        {places.length > 0 ? (
          <PlaceCarousel
            places={places}
            activeIndex={placeIndex}
            onChange={setPlaceIndex}
            isLocked={isEditing}
            renderCard={(place, isActive) =>
              isActive && draft ? (
                <PlaceEditCard
                  place={place}
                  draft={draft}
                  onDraftChange={setDraft}
                />
              ) : undefined
            }
          />
        ) : (
          <p className={styles.empty}>아직 이 카테고리에 카드가 없어요</p>
        )}
      </div>
      <div inert={isEditing}>
        <CategoryDial
          items={FAKE_RESULT_CATEGORIES}
          activeIndex={categoryIndex}
          onChange={handleCategoryChange}
          isRaised={isTutorialOpen}
        />
      </div>
      <button
        type="button"
        className={`${styles.roundButton} ${styles.saveButton}`}
        onClick={handleSave}
        disabled={!isEditing}
        aria-label="저장"
      >
        <img src={checkIcon} alt="" />
      </button>
      <button
        type="button"
        className={`${styles.roundButton} ${styles.editButton}`}
        onClick={handleEdit}
        disabled={places.length === 0}
        aria-label={isEditing ? "편집 끝내기" : "편집"}
      >
        <img src={editIcon} alt="" />
      </button>

      {isTutorialOpen && <DialTutorial onClose={closeTutorial} />}
      <ConfirmModal
        isOpen={pendingLeave !== null}
        icon="alert"
        title="변경사항이 감지되었어요."
        description="변경하신 내용을 저장할까요?"
        cancelLabel="그만두기"
        confirmLabel="저장하기"
        onCancel={finishLeave}
        onConfirm={handleLeaveSave}
      />

      {isToastVisible && <Toast message="편집하신 내용이 저장되었습니다." />}
    </main>
  );
}
