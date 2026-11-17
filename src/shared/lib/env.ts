// 로컬 개발이거나 Vercel 미리보기 배포(main 외 브랜치·PR)일 때만 true.
// 제출용 main 배포에서는 false라서 개발용 페이지가 숨겨짐
export const canSeeDevPages = import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === 'preview';

// 운영 BE 주소. .env에 VITE_API_BASE_URL이 없을 때 써요 (비밀 값이 아니에요)
const DEFAULT_API_BASE_URL = 'https://wayvi-backend-202941360326.asia-northeast3.run.app';

// API 서버 주소. .env의 VITE_API_BASE_URL (끝에 / 없이)
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
