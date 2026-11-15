import Button from "@/shared/components/Button";
import styles from "./AnalysisFailed.module.css";

type AnalysisFailedProps = {
  onRetry: () => void;
  onQuit: () => void;
};

// 정보 추출에 실패했을 때 화면. 다시 시도하면 링크 입력으로 돌아감
export default function AnalysisFailed({
  onRetry,
  onQuit,
}: AnalysisFailedProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>모아둔 정보를 가져오지 못했어요.</h1>
        <p className={styles.description}>
          링크가 비공개이거나 지원하지 않는 형식일 수도 있어요
        </p>
      </header>

      <div className={styles.actions}>
        <Button onClick={onRetry}>다시 시도</Button>
        <Button className={styles.quitButton} onClick={onQuit}>
          그만두기
        </Button>
      </div>
    </main>
  );
}
