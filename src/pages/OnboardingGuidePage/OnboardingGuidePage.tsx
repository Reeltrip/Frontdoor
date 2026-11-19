import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import { useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";
import stepOneArt from "@/shared/assets/images/onboarding/guide-step1.webp";
import stepTwoArt from "@/shared/assets/images/onboarding/guide-step2.webp";
import stepThreeArt from "@/shared/assets/images/onboarding/guide-step3.webp";
import styles from "./OnboardingGuidePage.module.css";

type GuideStep = {
  /** 피그마 '앱 사용안내'에서 내보낸 그림 (폰 외곽선 포함, 330×250) */
  art: string;
  title: string;
  description: string;
};

const GUIDE_STEPS: GuideStep[] = [
  {
    art: stepOneArt,
    title: "모아둔 릴스 링크를\n불러오세요!",
    description: "링크를 불러오기만 하면 자동으로 카드가 만들어져요!",
  },
  {
    art: stepTwoArt,
    title: "요약카드는 카테고리별로\n저장돼요.",
    description: "카드로 내가 모은 여행장소를 하나로 확인할 수 있어요.",
  },
  {
    art: stepThreeArt,
    title: "나만의 여행을 만들어보세요",
    description: "여행계획을 생성하고 지도 위에서 장소를\n둘러보세요!",
  },
];

const LAST_STEP = GUIDE_STEPS.length - 1;

export default function OnboardingGuidePage() {
  const navigate = useNavigate();
  // 화면 위쪽 색(#fafafa)을 상태바와 맨 위 띠에도 맞춰요
  useScreenBackdrop("#fafafa");
  const [step, setStep] = useState(0);
  const { art, title, description } = GUIDE_STEPS[step];
  const isLastStep = step === LAST_STEP;

  // 가입 직후 한 번만 보는 화면이라 뒤로 가기로 돌아오지 않게 해요
  const handleFinish = () => navigate("/home", { replace: true });
  const handleNext = () => setStep((current) => Math.min(current + 1, LAST_STEP));

  return (
    <main className={styles.page}>
      <img className={styles.art} src={art} alt="" width={330} height={250} />

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
