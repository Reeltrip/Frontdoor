import { Link } from 'react-router';
import { canSeeDevPages } from '@/shared/lib/env';

// 임시 홈 화면. 링크 추가 화면이 나오면 교체
export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22 }}>ReelTrip</h1>
      <p style={{ color: 'var(--color-text-sub)' }}>홈 화면은 준비 중이에요.</p>
      {canSeeDevPages && <Link to="/dev/components">컴포넌트 테스트 페이지 열기</Link>}
    </main>
  );
}
