import { useState } from "react";
import { useNavigate } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import Button from "@/shared/components/Button";
import TextField from "@/shared/components/TextField";
import ConfirmModal from "@/shared/components/ConfirmModal";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import { readClipboardLink } from "@/features/source/lib/readClipboardLink";
import type { AnalyzingState } from "@/features/source/model/source.types";
import { FAKE_RESULT_CATEGORIES } from "@/features/place/api/fakeResult";
import { searchFakeAddresses } from "@/features/place/api/fakeAddressSearch";
import {
  CARD_ADD_STEPS,
  PLACE_NAME_MAX_LENGTH,
  type CardAddStep,
} from "@/features/place/model/cardAdd.types";
import styles from "./CardAddPage.module.css";

const STEP_TITLES: Record<CardAddStep, string | null> = {
  category: null,
  name: "여행 장소는 어디인가요?",
  address: "여행 장소의 주소는 어느 곳인가요?",
};

const INITIAL_CATEGORY_INDEX = Math.max(
  FAKE_RESULT_CATEGORIES.findIndex((item) => item.category === "food"),
  0,
);

const PROGRESS_TOTAL = 5;

export default function CardAddPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CardAddStep>("category");
  const [categoryIndex, setCategoryIndex] = useState(INITIAL_CATEGORY_INDEX);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const stepIndex = CARD_ADD_STEPS.indexOf(step);
  const canGoNext =
    step === "category" ||
    (step === "name" ? name.trim() !== "" : address.trim() !== "");

  const handleBack = () => {
    if (stepIndex === 0) navigate(-1);
    else setStep(CARD_ADD_STEPS[stepIndex - 1]);
  };

  const handleNext = () => {
    if (step !== "address") {
      setStep(CARD_ADD_STEPS[stepIndex + 1]);
      return;
    }
    navigate("/library", {
      replace: true,
      state: { toast: "카드가 추가되었어요." },
    });
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

  const handleSearch = () => setResults(searchFakeAddresses(address));

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
          aria-valuemin={1}
          aria-valuemax={PROGRESS_TOTAL}
          aria-valuenow={stepIndex + 1}
        >
          <span
            className={styles.progressFill}
            style={{ width: `${((stepIndex + 1) / PROGRESS_TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {STEP_TITLES[step] && (
        <h1 className={styles.title}>{STEP_TITLES[step]}</h1>
      )}

      {step === "name" && (
        <TextField
          className={styles.field}
          value={name}
          onChange={setName}
          maxLength={PLACE_NAME_MAX_LENGTH}
          placeholder="장소 이름을 입력해 주세요"
          autoFocus
        />
      )}

      {step === "address" && (
        <div className={styles.addressArea}>
          <div className={styles.addressRow}>
            <input
              className={styles.addressInput}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="주소를 입력해 주세요"
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
          {results !== null && (
            <ul className={styles.results}>
              {results.length === 0 && (
                <li className={styles.noResult}>검색 결과가 없어요</li>
              )}
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

      <div
        className={`${styles.next} ${step === "category" ? styles.nextOnDial : ""}`}
      >
        <Button onClick={handleNext} disabled={!canGoNext}>
          {step === "address" ? "완료" : "다음"}
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
          />
        </div>
      )}

      {isTutorialOpen && (
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
