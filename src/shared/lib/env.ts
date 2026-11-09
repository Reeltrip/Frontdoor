// 로컬 개발이거나 Vercel 미리보기 배포(main 외 브랜치·PR)일 때만 true.
// 제출용 main 배포에서는 false라서 개발용 페이지가 숨겨짐
export const canSeeDevPages = import.meta.env.DEV || import.meta.env.VITE_VERCEL_ENV === 'preview';
