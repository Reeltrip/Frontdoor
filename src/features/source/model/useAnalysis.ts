import { useEffect, useState } from "react";
import { FAKE_STEP_DELAY_MS, willFakeAnalysisFail } from "../api/analyzeLinks";
import type { AnalysisStatus } from "./source.types";

export const ANALYSIS_STEPS = [
  "내 관심사 분석 중",
  "관광지 교통 분석 중",
  "요약 카드 마무리 중",
];

const FAKE_FAIL_AFTER_STEP = 1;

export function useAnalysis(links: string[]) {
  const [status, setStatus] = useState<AnalysisStatus>("running");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const willFail = willFakeAnalysisFail(links);
    let step = 0;

    const timer = window.setInterval(() => {
      step += 1;

      if (willFail && step > FAKE_FAIL_AFTER_STEP) {
        window.clearInterval(timer);
        setStatus("failed");
        return;
      }

      setCurrentStep(step);

      if (step >= ANALYSIS_STEPS.length) {
        window.clearInterval(timer);
        setStatus("done");
      }
    }, FAKE_STEP_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [links]);

  return { status, currentStep };
}
