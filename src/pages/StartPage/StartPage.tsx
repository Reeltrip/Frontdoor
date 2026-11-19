import { Link, Navigate, useNavigate } from "react-router";
import { hasAuthTokens } from "@/shared/lib/authToken";
import logo from "../../shared/assets/logo/wayvi-logo-white.svg";
import { DARK_BACKDROP, useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";
import styles from "./StartPage.module.css";
import Button from "@/shared/components/Button";

export default function StartPage() {
  useScreenBackdrop(DARK_BACKDROP);
  const navigate = useNavigate();

  // 이미 로그인했으면 시작 화면을 건너뛰어요
  if (hasAuthTokens()) return <Navigate to="/home" replace />;

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.logo} src={logo} alt="WAYVI" />
        <p className={styles.tagline}>여행의 발견부터 계획까지 하나로</p>
      </section>

      <section className={styles.actions}>
        <Button
          variant="glass"
          className={styles.loginButton}
          onClick={handleLoginClick}
        >
          로그인
        </Button>
        <p className={styles.signupText}>
          회원이 아니신가요?{" "}
          <Link to="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}
