// 공통 지도 데모. 팀원 브랜치와 demos.tsx 충돌을 피하려고 따로 둠
import type { ComponentDemo } from './demos';
import { MapRouteDemo, MapStatusDemo } from './MapWidgets';

export const mapDemos: ComponentDemo[] = [
  {
    name: 'MapView',
    path: 'shared/components/Map/MapView',
    description: '보관함·여행계획 공통 지도. .env에 지도 키가 없으면 키 없음 화면이 나와요',
    variants: [
      { label: '노드 · 선택 · 회색 노드 · 동선 · 플랜B', render: () => <MapRouteDemo /> },
      { label: '불러오는 중', render: () => <MapStatusDemo status="loading" /> },
      { label: '불러오기 실패', render: () => <MapStatusDemo status="error" /> },
      { label: '키 없음', render: () => <MapStatusDemo status="noKey" /> },
    ],
  },
];
