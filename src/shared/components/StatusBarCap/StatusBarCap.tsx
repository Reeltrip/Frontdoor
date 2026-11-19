import styles from './StatusBarCap.module.css';

/** 폰에서 화면 맨 위에 까는 단색 띠. 아이폰 홈 화면 앱의 상단 흐림을 막아요 (자세한 이유는 CSS에) */
export default function StatusBarCap() {
  return <div className={styles.cap} aria-hidden="true" />;
}
