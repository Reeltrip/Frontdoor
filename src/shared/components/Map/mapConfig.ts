import type { MapPosition } from './map.types';

// Google Maps JavaScript API 키. .env의 VITE_GOOGLE_MAPS_API_KEY.
// 브라우저에 노출되는 값이라 Google Cloud에서 HTTP 리퍼러 제한을 걸어 둬요
export const GOOGLE_MAPS_API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

// 사진 핀(Advanced Marker)은 지도 ID가 있어야 그려져요.
// 값이 없으면 구글이 테스트용으로 열어 둔 DEMO_MAP_ID를 써요
export const GOOGLE_MAPS_MAP_ID: string = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/** 시연 여행지인 후쿠오카 하카타·텐진 사이 */
export const DEFAULT_MAP_CENTER: MapPosition = { lat: 33.5902, lng: 130.4105 };

export const DEFAULT_MAP_ZOOM = 14;
