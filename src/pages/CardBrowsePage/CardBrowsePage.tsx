import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import checkIcon from "@/shared/assets/icons/dial-check.svg";
import editIcon from "@/shared/assets/icons/dial-edit.svg";
import Header from "@/shared/components/Header";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import PlaceCarousel from "@/features/place/ui/PlaceCarousel";
import { FAKE_PLACES_BY_CATEGORY } from "@/features/place/api/fakePlaces";
import {
  FAKE_RESULT_CATEGORIES,
  FAKE_RESULT_INITIAL_INDEX,
  FAKE_RESULT_REGION,
} from "@/features/place/api/fakeResult";
import styles from "./CardBrowsePage.module.css";

const TUTORIAL_SEEN_KEY = "reeltrip:dial-tutorial-seen";

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

  const category = FAKE_RESULT_CATEGORIES[categoryIndex];
  const places = FAKE_PLACES_BY_CATEGORY[category.category] ?? [];

  const closeTutorial = () => {
    markTutorialSeen();
    setIsTutorialOpen(false);
  };

  const handleCategoryChange = (index: number) => {
    setCategoryIndex(index);
    setPlaceIndex(0);
    closeTutorial();
  };

  const handleEdit = () => {};
  const handleSave = () => {};

  return (
    <main className={styles.page}>
      <Header title={FAKE_RESULT_REGION} onBack={() => navigate(-1)} />

      <div className={styles.stage}>
        {places.length > 0 ? (
          <PlaceCarousel
            places={places}
            activeIndex={placeIndex}
            onChange={setPlaceIndex}
          />
        ) : (
          <p className={styles.empty}>아직 이 카테고리에 카드가 없어요</p>
        )}
      </div>

      <CategoryDial
        items={FAKE_RESULT_CATEGORIES}
        activeIndex={categoryIndex}
        onChange={handleCategoryChange}
        isRaised={isTutorialOpen}
      />

      <button
        type="button"
        className={`${styles.roundButton} ${styles.saveButton}`}
        onClick={handleSave}
        aria-label="저장"
      >
        <img src={checkIcon} alt="" />
      </button>
      <button
        type="button"
        className={`${styles.roundButton} ${styles.editButton}`}
        onClick={handleEdit}
        aria-label="편집"
      >
        <img src={editIcon} alt="" />
      </button>

      {isTutorialOpen && <DialTutorial onClose={closeTutorial} />}
    </main>
  );
}
