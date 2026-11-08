import { Link, useNavigate } from "react-router";
import logo from "../../shared/assets/logo/wayvi-logo-white.svg";
import startBg from "../../shared/assets/images/start-bg.png";
import styles from "./StartPage.module.css";

export default function StartPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <main className={styles.page}>
      <img className={styles.background} src={startBg} alt="" />
      <div className={styles.overlay} />

      <section className={styles.hero}>
        <img className={styles.logo} src={logo} alt="WAYVI" />
        <p className={styles.tagline}>여행의 발견부터 계획까지 하나로</p>
      </section>

      <section className={styles.actions}>
        <button
          type="button"
          className={styles.loginButton}
          onClick={handleLoginClick}
        >
          로그인
        </button>
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
