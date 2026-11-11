// 로컬 개발이거나 Vercel 미리보기 배포(main 외 브랜치·PR)일 때만 true.
// 제출용 main 배포에서는 false라서 개발용 페이지가 숨겨짐
export const canSeeDevPages = import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === 'preview';

// API 서버 주소. .env의 VITE_API_BASE_URL (끝에 / 없이)
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

// 가짜 응답 사용 여부. VITE_USE_FAKE_API=false일 때만 실제 서버로 요청해요.
// BE API가 정해지기 전까지 값이 없으면 가짜 응답을 써요
export const isFakeApiEnabled = import.meta.env.VITE_USE_FAKE_API !== 'false';
