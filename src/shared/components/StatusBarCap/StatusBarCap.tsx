import { useEffect, useState } from 'react';
import styles from './StatusBarCap.module.css';

const readBackdrop = () => document.documentElement.style.getPropertyValue('--screen-backdrop');

/** 폰에서 화면 맨 위에 까는 단색 띠. 아이폰 홈 화면 앱의 상단 흐림을 막아요 (자세한 이유는 CSS에) */
export default function StatusBarCap() {
  const [version, setVersion] = useState(0);

  // Safari는 띠 색을 한 번 읽고, 같은 요소의 색만 바뀌면 상태바 색을 다시 칠하지 않아요.
  // 그래서 화면 위쪽 색(useScreenBackdrop)이 바뀔 때마다 띠를 새로 만들어요 (#116)
  useEffect(() => {
    let current = readBackdrop();
    const observer = new MutationObserver(() => {
      const next = readBackdrop();
      if (next === current) return;
      current = next;
      setVersion((value) => value + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return <div key={version} className={styles.cap} aria-hidden="true" />;
}
