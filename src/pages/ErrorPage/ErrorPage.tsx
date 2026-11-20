import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import Button from "@/shared/components/Button";
import { LIME_BACKDROP, useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";
import styles from "./ErrorPage.module.css";

type ErrorPageProps = {
  /** 없는 주소로 들어왔을 때 */
  isNotFound?: boolean;
};

const reloadPage = () => window.location.reload();

// 화면을 그리다 오류가 나거나 없는 주소로 들어왔을 때 보여 주는 화면.
// 기본 오류 화면(영문 스택)이 데모 중에 뜨지 않게 라우터 맨 바깥에서 받아요.
export default function ErrorPage({ isNotFound = false }: ErrorPageProps) {
  const error = useRouteError();
  const navigate = useNavigate();
  // 화면 위쪽이 연두(--color-lime-50)라 상태바도 같은 색이에요 (#185)
  useScreenBackdrop(LIME_BACKDROP);
  const isMissingPage =
    isNotFound || (isRouteErrorResponse(error) && error.status === 404);

  const goHome = () => navigate("/home", { replace: true });

  return (
    <main className={styles.page} role="alert">
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isMissingPage
            ? "페이지를 찾을 수 없어요."
            : "화면을 불러오지 못했어요."}
        </h1>
        <p className={styles.description}>
          {isMissingPage
            ? "주소가 바뀌었거나 없는 페이지예요."
            : "잠시 후 다시 시도해 주세요."}
        </p>
        {import.meta.env.DEV && !isMissingPage && error instanceof Error && (
          <pre className={styles.devMessage}>{error.message}</pre>
        )}
      </header>

      <div className={styles.actions}>
        {isMissingPage ? (
          <Button onClick={goHome}>홈으로</Button>
        ) : (
          <>
            <Button onClick={reloadPage}>다시 시도</Button>
            <Button className={styles.homeButton} onClick={goHome}>
              홈으로
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
