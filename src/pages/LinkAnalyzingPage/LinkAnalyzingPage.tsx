import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { LoadingBlob } from "@/shared/components/Loading";
import AnalysisSteps from "@/features/source/ui/AnalysisSteps";
import AnalysisFailed from "@/features/source/ui/AnalysisFailed";
import {
  ANALYSIS_STEPS,
  useAnalysis,
} from "@/features/source/model/useAnalysis";
import { isAnalyzingState } from "@/features/source/model/source.types";
import { useProfile } from "@/features/account/model/useAccount";
import styles from "./LinkAnalyzingPage.module.css";

const RESULT_DELAY_MS = 600;
const DEFAULT_NICKNAME = "여행자";

export default function LinkAnalyzingPage() {
  const location = useLocation();

  // 주소로 바로 들어오면 넘겨받은 링크가 없으니 입력 화면으로 돌려보냄
  if (!isAnalyzingState(location.state)) {
    return <Navigate to="/links/new" replace />;
  }

  // location.key는 화면에 들어올 때마다 달라서, 같은 링크를 다시 넣어도 새로 분석해요
  return <AnalyzingView links={location.state.links} runKey={location.key} />;
}

function AnalyzingView({ links, runKey }: { links: string[]; runKey: string }) {
  const navigate = useNavigate();
  const { status, currentStep, failMessage } = useAnalysis(links, runKey);
  const nickname = useProfile().data?.nickname ?? DEFAULT_NICKNAME;

  useEffect(() => {
    if (status !== "done") return;
    const timer = window.setTimeout(
      () => navigate("/result", { replace: true }),
      RESULT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  if (status === "failed") {
    return (
      <AnalysisFailed
        message={failMessage}
        onRetry={() => navigate("/links/new", { replace: true })}
        onQuit={() => navigate("/")}
      />
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {nickname}님께 꼭 맞는 맞춤 카드가
          <br />
          만들어지고 있어요 !
        </h1>
        <p className={styles.description}>잠시만 기다려주세요...</p>
      </header>

      <div className={styles.loading}>
        <LoadingBlob />
      </div>

      <div className={styles.steps}>
        <AnalysisSteps steps={ANALYSIS_STEPS} currentStep={currentStep} />
      </div>
    </main>
  );
}
