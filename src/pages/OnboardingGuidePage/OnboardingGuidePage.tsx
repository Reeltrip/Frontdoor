import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import foodImage from "@/shared/assets/images/result/food.png";
import foodIcon from "@/shared/assets/icons/wheel-food.svg";
import tripImage from "@/shared/assets/images/start-bg.png";
import styles from "./OnboardingGuidePage.module.css";

type GuideStep = {
  title: string;
  description: string;
};

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "모아둔 릴스 링크를\n불러오세요!",
    description: "링크를 불러오기만 하면 자동으로 카드가 만들어져요!",
  },
  {
    title: "요약카드는 카테고리별로\n저장돼요.",
    description: "카드로 내가 모은 여행장소를 하나로 확인할 수 있어요.",
  },
  {
    title: "나만의 여행을 만들어보세요",
    description: "여행계획을 생성하고 지도 위에서 장소를\n둘러보세요!",
  },
];

const LAST_STEP = GUIDE_STEPS.length - 1;

export default function OnboardingGuidePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { title, description } = GUIDE_STEPS[step];
  const isLastStep = step === LAST_STEP;

  // 가입 직후 한 번만 보는 화면이라 뒤로 가기로 돌아오지 않게 해요
  const handleFinish = () => navigate("/home", { replace: true });
  const handleNext = () => setStep((current) => Math.min(current + 1, LAST_STEP));

  return (
    <main className={styles.page}>
      <div className={styles.art} aria-hidden>
        <div className={styles.phone}>
          <span className={styles.notch} />
        </div>

        {step === 0 && (
          <div className={styles.linkPills}>
            <span className={styles.linkPill}>+ 링크 불러오기</span>
            <span className={styles.linkPill}>+ 링크 불러오기</span>
          </div>
        )}

        {step === 1 && (
          <div className={styles.categoryCard}>
            <span className={styles.categoryPhoto}>
              <img className={styles.categoryImage} src={foodImage} alt="" />
              <img className={styles.categoryIcon} src={foodIcon} alt="" />
            </span>
            <span className={styles.categoryText}>
              <strong className={styles.categoryName}>맛집, 대표 메뉴</strong>
              <span className={styles.categoryHint}>식사 위주의 음식점</span>
            </span>
            <span className={styles.categoryView}>보기</span>
          </div>
        )}

        {step === 2 && (
          <div className={styles.tripCard}>
            <img className={styles.tripImage} src={tripImage} alt="" />
            <span className={styles.tripLabel}>다가오는 여행 | 오사카 여행</span>
          </div>
        )}
      </div>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>

      <div className={styles.actions}>
        {isLastStep ? (
          <Button onClick={handleFinish}>시작하기</Button>
        ) : (
          <div className={styles.stepRow}>
            <button type="button" className={styles.textButton} onClick={handleFinish}>
              건너뛰기
            </button>
            <div
              className={styles.dots}
              role="img"
              aria-label={`${GUIDE_STEPS.length}장 중 ${step + 1}번째`}
            >
              {GUIDE_STEPS.map((guide, index) => (
                <span
                  key={guide.title}
                  className={index === step ? styles.dotActive : styles.dot}
                />
              ))}
            </div>
            <button type="button" className={styles.textButton} onClick={handleNext}>
              다음
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
