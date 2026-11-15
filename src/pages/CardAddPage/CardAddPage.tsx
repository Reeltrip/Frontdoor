import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import PlaceFeatureForm from "@/features/place/ui/PlaceFeatureForm";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import { readClipboardLink } from "@/features/source/lib/readClipboardLink";
import type { AnalyzingState } from "@/features/source/model/source.types";
import { FAKE_RESULT_CATEGORIES } from "@/features/place/api/fakeResult";
import { searchFakeAddresses } from "@/features/place/api/fakeAddressSearch";
import {
  CARD_ADD_STEPS,
  EMPTY_CARD_FEATURES,
  PLACE_NAME_MAX_LENGTH,
  type CardAddStep,
  type CardFeatures,
} from "@/features/place/model/cardAdd.types";
import styles from "./CardAddPage.module.css";

const STEP_TITLES: Record<CardAddStep, string | null> = {
  category: null,
  name: "여행 장소는 어디인가요?",
  address: "여행 장소의 주소는 어느 곳인가요?",
  features: "여행 장소의 특징을 알려주세요",
};

const STEP_SUBTITLES: Record<CardAddStep, string | null> = {
  category: null,
  name: "최대 50자까지 적을 수 있어요.",
  address: "지도에서 찾아볼 수 있어요.",
  features: "사진과 가격, 대표특징을 알아보아요.",
};

const INITIAL_CATEGORY_INDEX = Math.max(
  FAKE_RESULT_CATEGORIES.findIndex((item) => item.category === "food"),
  0,
);

const PROGRESS_PERCENTS: Record<CardAddStep, number> = {
  category: 20,
  name: 40,
  address: 60,
  features: 80,
};

export default function CardAddPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CardAddStep>("category");
  const [categoryIndex, setCategoryIndex] = useState(INITIAL_CATEGORY_INDEX);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [features, setFeatures] = useState<CardFeatures>(EMPTY_CARD_FEATURES);
  const [results, setResults] = useState<string[] | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const nameRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = nameRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [name, step]);

  const stepIndex = CARD_ADD_STEPS.indexOf(step);
  const hasFeatures =
    features.photoUrl !== null ||
    features.tags.length > 0 ||
    features.price.trim() !== "" ||
    features.memo.trim() !== "";
  const canGoNext = {
    category: true,
    name: name.trim() !== "",
    address: address.trim() !== "",
    features: hasFeatures,
  }[step];

  const handleBack = () => {
    if (stepIndex === 0) navigate(-1);
    else setStep(CARD_ADD_STEPS[stepIndex - 1]);
  };

  const handleNext = () => {
    setIsTutorialOpen(false);
    if (step !== "features") {
      setStep(CARD_ADD_STEPS[stepIndex + 1]);
      return;
    }
    const state: AnalyzingState = { links: ["manual-card"] };
    navigate("/links/analyzing", { replace: true, state });
  };

  const handleImportLink = async () => {
    setIsImportModalOpen(false);
    const link = await readClipboardLink();
    if (!link) {
      navigate("/links/new", { replace: true });
      return;
    }
    const state: AnalyzingState = { links: [link] };
    navigate("/links/analyzing", { replace: true, state });
  };

  const handleWriteDirectly = () => {
    setIsImportModalOpen(false);
    setIsTutorialOpen(true);
  };

  const handleSearch = () => {
    if (address.trim() === "") {
      setResults(null);
      return;
    }
    setResults(searchFakeAddresses(address));
  };

  const handlePickAddress = (picked: string) => {
    setAddress(picked);
    setResults(null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        {}
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
        >
          <img src={backIcon} alt="" />
          {isImportModalOpen ? (
            <span className={styles.screenTitle}>카드 직접 추가</span>
          ) : (
            "뒤로"
          )}
        </button>
        <div
          className={styles.progress}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={PROGRESS_PERCENTS[step]}
        >
          <span
            className={styles.progressFill}
            style={{ width: `${PROGRESS_PERCENTS[step]}%` }}
          />
        </div>
      </div>

      {STEP_TITLES[step] && (
        <header
          className={`${styles.heading} ${step === "features" ? styles.headingTight : ""}`}
        >
          <h1 className={styles.title}>{STEP_TITLES[step]}</h1>
          {STEP_SUBTITLES[step] && (
            <p className={styles.subtitle}>{STEP_SUBTITLES[step]}</p>
          )}
        </header>
      )}

      {step === "name" && (
        <div className={styles.field}>
          <textarea
            ref={nameRef}
            className={styles.nameInput}
            value={name}
            rows={1}
            maxLength={PLACE_NAME_MAX_LENGTH}
            placeholder="장소를 입력해주세요."
            onChange={(event) => setName(event.target.value.replace(/\n/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            autoFocus
          />
          <p className={styles.counter} aria-live="polite">
            ({name.length}/{PLACE_NAME_MAX_LENGTH})
          </p>
        </div>
      )}

      {step === "address" && (
        <div className={styles.addressArea}>
          <div className={styles.addressRow}>
            <input
              className={styles.addressInput}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="주소를 검색해주세요."
              autoFocus
            />
            <button
              type="button"
              className={styles.searchButton}
              onClick={handleSearch}
            >
              주소 찾기
            </button>
          </div>
          {results !== null && results.length > 0 && (
            <ul className={styles.results}>
              {results.map((result) => (
                <li key={result}>
                  <button
                    type="button"
                    className={styles.resultItem}
                    onClick={() => handlePickAddress(result)}
                  >
                    {result}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === "features" && (
        <PlaceFeatureForm value={features} onChange={setFeatures} />
      )}

      <div
        className={`${styles.next} ${step === "category" ? styles.nextOnDial : ""}`}
      >
        <Button onClick={handleNext} disabled={!canGoNext}>
          다음
        </Button>
      </div>

      {step === "category" && (
        <div className={styles.dialArea}>
          <CategoryDial
            items={FAKE_RESULT_CATEGORIES}
            activeIndex={categoryIndex}
            onChange={(index) => {
              setCategoryIndex(index);
              setIsTutorialOpen(false);
            }}
            isRaised={isTutorialOpen}
            isTickHidden={isTutorialOpen}
            hasGlow={isTutorialOpen}
          />
        </div>
      )}

      {isTutorialOpen && isTutorialOpen && (
        <DialTutorial
          onClose={() => setIsTutorialOpen(false)}
          lines={["다이얼을 돌려", "카드 카테고리를 정해보세요!"]}
        />
      )}

      <ConfirmModal
        isOpen={isImportModalOpen}
        icon="link"
        title="링크가 있다면 자동으로 카드 채우기"
        description="내용을 직접 쓰지 않고도 내용을 쓸 수 있어요."
        cancelLabel="직접 쓰기"
        confirmLabel="불러오기"
        onCancel={handleWriteDirectly}
        onConfirm={handleImportLink}
        isDismissible={false}
      />
    </main>
  );
}
