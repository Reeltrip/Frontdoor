import { Navigate, useLocation, useNavigate } from "react-router";
import { LoadingBlob } from "@/shared/components/Loading";
import AnalysisSteps from "@/features/source/ui/AnalysisSteps";
import AnalysisFailed from "@/features/source/ui/AnalysisFailed";
import {
  ANALYSIS_STEPS,
  useAnalysis,
} from "@/features/source/model/useAnalysis";
import { isAnalyzingState } from "@/features/source/model/source.types";
import styles from "./LinkAnalyzingPage.module.css";

// 가짜 데이터: 닉네임을 저장하는 곳이 정해지면 교체
const FAKE_NICKNAME = "여행자";

export default function LinkAnalyzingPage() {
  const location = useLocation();

  // 주소로 바로 들어오면 넘겨받은 링크가 없으니 입력 화면으로 돌려보냄
  if (!isAnalyzingState(location.state)) {
    return <Navigate to="/links/new" replace />;
  }

  return <AnalyzingView links={location.state.links} />;
}

function AnalyzingView({ links }: { links: string[] }) {
  const navigate = useNavigate();
  const { status, currentStep } = useAnalysis(links);

  if (status === "failed") {
    return (
      <AnalysisFailed
        onRetry={() => navigate("/links/new", { replace: true })}
        onQuit={() => navigate("/")}
      />
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {FAKE_NICKNAME}님께 꼭 맞는 맞춤 카드가
          <br />
          만들어지고 있어요 !
        </h1>
        <p className={styles.description}>
          {status === "done"
            ? "잠시만 기다려주세요..."
            : "잠시만 기다려주세요..."}
        </p>
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
