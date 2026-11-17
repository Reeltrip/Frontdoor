import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import checkIcon from "@/shared/assets/icons/dial-check.svg";
import editIcon from "@/shared/assets/icons/dial-edit.svg";
import Header from "@/shared/components/Header";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import EditTutorial from "@/features/place/ui/EditTutorial";
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
import type { Place } from "@/features/place/model/place.types";
import {
  RESULT_CATEGORIES,
  useResultPlaces,
} from "@/features/place/model/useResultPlaces";
import { useUpdatePlace } from "@/features/place/model/usePlaces";
import { getErrorMessage } from "@/shared/api/client";
import styles from "./CardBrowsePage.module.css";

const TUTORIAL_SEEN_KEY = "reeltrip:dial-tutorial-seen";
const EDIT_TUTORIAL_SEEN_KEY = "reeltrip:edit-tutorial-seen";
const TOAST_DURATION_MS = 2000;

function hasSeen(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {}
}

type CardBrowseState = { categoryIndex?: number };

/** 결과 화면에서 고른 카테고리. 주소로 바로 들어왔으면 null (카드가 가장 많은 카테고리로 시작) */
function getInitialCategoryIndex(state: unknown): number | null {
  const { categoryIndex } = (state ?? {}) as CardBrowseState;
  if (typeof categoryIndex === "number" && RESULT_CATEGORIES[categoryIndex])
    return categoryIndex;
  return null;
}

export default function CardBrowsePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, items, placesByCategory, initialIndex } = useResultPlaces();
  const updatePlace = useUpdatePlace();
  const [pickedCategoryIndex, setCategoryIndex] = useState(() =>
    getInitialCategoryIndex(location.state),
  );
  const categoryIndex = pickedCategoryIndex ?? initialIndex;
  const [placeIndex, setPlaceIndex] = useState(0);
  const [isTutorialOpen, setIsTutorialOpen] = useState(
    () => !hasSeen(TUTORIAL_SEEN_KEY),
  );
  const [isEditTutorialOpen, setIsEditTutorialOpen] = useState(false);
  const [draft, setDraft] = useState<PlaceDraft | null>(null);
  const [pendingLeave, setPendingLeave] = useState<"back" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isToastVisible = toastMessage !== null;

  const category = items[categoryIndex];
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
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isToastVisible]);

  const closeTutorial = () => {
    markSeen(TUTORIAL_SEEN_KEY);
    setIsTutorialOpen(false);
    if (!hasSeen(EDIT_TUTORIAL_SEEN_KEY)) setIsEditTutorialOpen(true);
  };

  const closeEditTutorial = () => {
    markSeen(EDIT_TUTORIAL_SEEN_KEY);
    setIsEditTutorialOpen(false);
  };
  const handleCategoryChange = (index: number) => {
    setCategoryIndex(index);
    setPlaceIndex(0);
    closeTutorial();
  };

  const savePlace = (place: Place, nextDraft: PlaceDraft) => {
    const next = applyDraft(place, nextDraft);
    updatePlace.mutate(
      {
        id: place.id,
        category: place.category,
        // 바뀐 항목만 보내요. 안 고친 항목을 같이 보내면 서버의 다른 값을 덮어쓸 수 있어요
        changes: {
          ...(next.name !== place.name ? { name: next.name } : {}),
          ...(next.summary[0] !== place.summary[0]
            ? { summaryFirst: next.summary[0] ?? "" }
            : {}),
          ...(next.tag !== place.tag ? { tag: next.tag } : {}),
        },
      },
      {
        onSuccess: () => setToastMessage("편집하신 내용이 저장되었습니다."),
        onError: (error) =>
          setToastMessage("저장하지 못했어요. " + getErrorMessage(error)),
      },
    );
  };

  const handleEdit = () => {
    closeEditTutorial();
    if (activePlace) setDraft(toDraft(activePlace));
    return;
  };

  const handleSave = () => {
    if (!activePlace || !draft) return;
    if (isChanged) savePlace(activePlace, draft);
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
    if (activePlace && draft) savePlace(activePlace, draft);
    finishLeave();
  };

  return (
    <main className={styles.page}>
      <Header title={title} onBack={handleBack} />

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
          items={items}
          activeIndex={categoryIndex}
          onChange={handleCategoryChange}
          isRaised={isTutorialOpen}
        />
      </div>
      {isEditing ? (
        <button
          type="button"
          className={`${styles.roundButton} ${styles.saveButton}`}
          onClick={handleSave}
          aria-label="저장"
        >
          <img src={checkIcon} alt="" />
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.roundButton} ${styles.editButton} ${isEditTutorialOpen ? styles.aboveTutorial : ""}`}
          onClick={handleEdit}
          disabled={places.length === 0}
          aria-label="편집"
        >
          <img src={editIcon} alt="" />
        </button>
      )}
      {isTutorialOpen && <DialTutorial onClose={closeTutorial} />}
      {isEditTutorialOpen && <EditTutorial onClose={closeEditTutorial} />}
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

      {toastMessage && <Toast message={toastMessage} />}
    </main>
  );
}
