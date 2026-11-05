import type { RouteObject } from 'react-router';
import HomePage from '@/pages/HomePage/HomePage';
import ComponentTestPage from '@/pages/ComponentTestPage/ComponentTestPage';
import { canSeeDevPages } from '@/shared/lib/env';

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  // 컴포넌트 테스트 페이지는 로컬과 Vercel 미리보기에서만 열림 (제출용 main 배포에는 안 나옴)
  ...(canSeeDevPages ? [{ path: '/dev/components', element: <ComponentTestPage /> }] : []),
];
