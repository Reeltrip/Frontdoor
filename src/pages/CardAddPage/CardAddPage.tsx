import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import PlaceFeatureForm from "@/features/place/ui/PlaceFeatureForm";
import CategoryDial from "@/features/place/ui/CategoryDial";
import DialTutorial from "@/features/place/ui/DialTutorial";
import AnalysisSteps from "@/features/source/ui/AnalysisSteps";
import { LoadingBlob } from "@/shared/components/Loading";
import { useProfile } from "@/features/account/model/useAccount";
import analyzingStyles from "@/pages/LinkAnalyzingPage/LinkAnalyzingPage.module.css";
import { readClipboardLink } from "@/features/source/lib/readClipboardLink";
import type { AnalyzingState } from "@/features/source/model/source.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/api/client";
import {
  createPlaces,
  placeKeys,
  searchPlaces,
  toApiCategory,
  uploadImage,
  type ApiPlace,
  type PlaceSearchResult,
} from "@/features/place/api/places";
import { saveLastResult } from "@/features/place/model/lastResult";
import { RESULT_CATEGORIES } from "@/features/place/model/useResultPlaces";
import type { ResultCategoryItem } from "@/features/place/model/result.types";
import {
  CARD_ADD_STEPS,
  EMPTY_CARD_FEATURES,
  PLACE_NAME_MAX_LENGTH,
  type CardAddStep,
  type CardFeatures,
} from "@/features/place/model/cardAdd.types";
import styles from "./CardAddPage.module.css";
import { useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";

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

const CATEGORY_ITEMS: ResultCategoryItem[] = RESULT_CATEGORIES.map(
  ({ category, title }) => ({ id: category, category, title, description: "" }),
);

const INITIAL_CATEGORY_INDEX = Math.max(
  CATEGORY_ITEMS.findIndex((item) => item.category === "food"),
  0,
);

const PROGRESS_PERCENTS: Record<CardAddStep, number> = {
  category: 20,
  name: 40,
  address: 60,
  features: 80,
};

// 저장이 금방 끝나도 '카드를 만들고 있어요' 화면이 깜빡이고 사라지지 않게 최소 시간을 둬요
const MIN_CREATING_MS = 1500;
const CREATING_STEP_MS = 500;
const CREATING_STEPS = [
  "입력한 내용 확인 중",
  "사진 올리는 중",
  "요약 카드 마무리 중",
];
const DEFAULT_NICKNAME = "여행자";

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function CardAddPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<CardAddStep>("category");
  const [categoryIndex, setCategoryIndex] = useState(INITIAL_CATEGORY_INDEX);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [features, setFeatures] = useState<CardFeatures>(EMPTY_CARD_FEATURES);
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null);
  /** 검색 결과에서 고른 장소. 지도에 올릴 좌표가 여기서 와요 */
  const [pickedPlace, setPickedPlace] = useState<PlaceSearchResult | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const category = CATEGORY_ITEMS[categoryIndex].category;
  // 팁 카드는 지도에 올리지 않아서 좌표와 사진이 없어도 돼요
  const isTip = category === "tip";

  const createCard = useMutation({
    mutationFn: async () => {
      const imageUrl = features.photoFile
        ? await uploadImage(features.photoFile)
        : undefined;
      const price = features.price.trim() || undefined;
      const memo = features.memo.trim() || undefined;
      const card: ApiPlace = isTip
        ? {
            category: "TIP",
            name: name.trim(),
            subType: features.tags[0] ?? "팁",
            applicableRegion: pickedPlace?.name ?? address.trim(),
            placeText: address.trim(),
            cost: price,
            memo,
            imageUrl,
          }
        : {
            category: toApiCategory(category),
            name: name.trim(),
            address: pickedPlace?.address ?? address.trim(),
            latitude: pickedPlace?.latitude,
            longitude: pickedPlace?.longitude,
            googlePlaceId: pickedPlace?.googlePlaceId,
            imageUrl,
            keyPoints: features.tags,
            priceText: price,
            memo,
          };
      return createPlaces([card]);
    },
  });
  const saveCard = useMutation({
    // 실패하면 기다리지 않고 바로 입력 화면으로 돌아가요
    mutationFn: async () =>
      (await Promise.all([createCard.mutateAsync(), wait(MIN_CREATING_MS)]))[0],
    onSuccess: async (result) => {
      saveLastResult({ placeIds: result.placeIds, title: null });
      await queryClient.invalidateQueries({ queryKey: placeKeys.all });
      navigate("/library", { replace: true });
    },
    onError: (error) => setErrorMessage(getErrorMessage(error)),
  });
  useScreenBackdrop(saveCard.isPending ? "#fafafa" : "#ffffff");
  const [isImportModalOpen, setIsImportModalOpen] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isArrowTutorialOpen, setIsArrowTutorialOpen] = useState(false);

  const nickname = useProfile().data?.nickname ?? DEFAULT_NICKNAME;
  const [creatingStep, setCreatingStep] = useState(0);

  const nameRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!saveCard.isPending) return;
    const timer = window.setInterval(
      () =>
        setCreatingStep((prev) =>
          Math.min(prev + 1, CREATING_STEPS.length - 1),
        ),
      CREATING_STEP_MS,
    );
    return () => {
      window.clearInterval(timer);
      setCreatingStep(0);
    };
  }, [saveCard.isPending]);

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
    // 장소 카드는 검색 결과에서 골라야 좌표가 생겨요
    address: isTip ? address.trim() !== "" : pickedPlace !== null,
    // 장소 카드는 사진이 필수예요 (서버 규칙)
    features:
      (isTip ? hasFeatures : features.photoFile !== null) &&
      !saveCard.isPending,
  }[step];

  const handleBack = () => {
    if (stepIndex === 0) navigate(-1);
    else setStep(CARD_ADD_STEPS[stepIndex - 1]);
  };

  const handleNext = () => {
    setIsTutorialOpen(false);
    setIsArrowTutorialOpen(false);
    setErrorMessage(null);
    if (step !== "features") {
      setStep(CARD_ADD_STEPS[stepIndex + 1]);
      return;
    }
    saveCard.mutate();
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

  // 다이얼 안내가 끝나면 화살표 안내로 이어짐
  const handleDialTutorialClose = () => {
    setIsTutorialOpen(false);
    setIsArrowTutorialOpen(true);
  };

  const handleCategoryChange = (index: number) => {
    setCategoryIndex(index);
    if (isTutorialOpen) handleDialTutorialClose();
    else setIsArrowTutorialOpen(false);
  };

  const handleSearch = async () => {
    const query = address.trim();
    if (query === "" || isSearching) return;
    setIsSearching(true);
    setErrorMessage(null);
    try {
      setResults(await searchPlaces(query));
    } catch (error) {
      setResults(null);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickAddress = (picked: PlaceSearchResult) => {
    setPickedPlace(picked);
    setAddress(picked.address ?? picked.name);
    setResults(null);
  };

  // 피그마 '카드 직접 추가' 마지막 화면. 링크 분석 중 화면과 같은 모양이에요
  if (saveCard.isPending) {
    return (
      <main className={analyzingStyles.page} role="status">
        <header className={analyzingStyles.header}>
          <h1 className={analyzingStyles.title}>
            {nickname}님이 입력하신 내용으로
            <br />
            카드를 만들고 있어요 !
          </h1>
          <p className={analyzingStyles.description}>잠시만 기다려주세요...</p>
        </header>
        <div className={analyzingStyles.loading}>
          <LoadingBlob />
        </div>
        <div className={analyzingStyles.steps}>
          <AnalysisSteps steps={CREATING_STEPS} currentStep={creatingStep} />
        </div>
      </main>
    );
  }

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
              onChange={(event) => {
                setAddress(event.target.value);
                setPickedPlace(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleSearch();
              }}
              placeholder="주소를 검색해주세요."
              autoFocus
            />
            <button
              type="button"
              className={styles.searchButton}
              onClick={() => void handleSearch()}
              disabled={isSearching}
            >
              {isSearching ? "찾는 중" : "주소 찾기"}
            </button>
          </div>
          {results !== null && results.length > 0 && (
            <ul className={styles.results}>
              {results.map((result) => (
                <li key={result.googlePlaceId}>
                  <button
                    type="button"
                    className={styles.resultItem}
                    onClick={() => handlePickAddress(result)}
                  >
                    {result.name}
                    {result.address ? " · " + result.address : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results !== null && results.length === 0 && (
            <p className={styles.subtitle}>
              검색 결과가 없어요. 다른 이름으로 찾아보세요.
            </p>
          )}
          {!isTip && pickedPlace === null && results === null && (
            <p className={styles.subtitle}>
              주소 찾기로 검색한 뒤 목록에서 골라 주세요.
            </p>
          )}
        </div>
      )}

      {step === "features" && (
        <PlaceFeatureForm value={features} onChange={setFeatures} />
      )}

      <div
        className={`${styles.next} ${step === "category" ? styles.nextOnDial : ""}`}
      >
        {errorMessage && (
          <p className={styles.subtitle} role="alert">
            {errorMessage}
          </p>
        )}
        <Button onClick={handleNext} disabled={!canGoNext}>
          {saveCard.isPending
            ? "저장하는 중"
            : step === "features"
              ? "저장"
              : "다음"}
        </Button>
      </div>

      {step === "category" && (
        <div className={styles.dialArea}>
          <CategoryDial
            items={CATEGORY_ITEMS}
            activeIndex={categoryIndex}
            onChange={handleCategoryChange}
            isRaised={isTutorialOpen}
            isTickHidden={isTutorialOpen}
            hasGlow={isTutorialOpen}
            isArrowGuide={isArrowTutorialOpen}
          />
        </div>
      )}

      {isTutorialOpen && (
        <DialTutorial
          onClose={handleDialTutorialClose}
          lines={["다이얼을 돌려", "세부 카드 내용들을 살펴보세요!"]}
        />
      )}
      {isArrowTutorialOpen && (
        <DialTutorial
          variant="arrows"
          onClose={() => setIsArrowTutorialOpen(false)}
          lines={["화살표를 눌러", "카드 카테고리를 정해보세요!"]}
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
