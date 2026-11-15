// 서버 상태 훅 예시. 팀원 브랜치와 demos.tsx 충돌을 피하려고 따로 둠
import type { ComponentDemo } from './demos';
import { ApiModeNote, PlacesDemo, PlanDemo, SourceStatusDemo } from './ServerStateWidgets';

export const serverStateDemos: ComponentDemo[] = [
  {
    name: 'useSourceStatus',
    path: 'features/source/model/useSourceStatus.ts',
    description: 'POST /sources → GET /sources/{id} 1초 폴링, 중복 링크 모달',
    variants: [
      { label: 'API 모드', render: () => <ApiModeNote /> },
      { label: '링크 등록·분석 상태', render: () => <SourceStatusDemo /> },
    ],
  },
  {
    name: 'usePlaces',
    path: 'features/place/model/usePlaces.ts',
    description: 'GET /places 카테고리 필터, PATCH /places/{id} 후 목록 다시 불러오기',
    variants: [{ label: '목록·빈 화면·수정', render: () => <PlacesDemo /> }],
  },
  {
    name: 'usePlan',
    path: 'features/plan/model/usePlan.ts',
    description: 'GET /plans/{id}, PUT /plans/{id} 노드 순서 낙관적 업데이트',
    variants: [
      { label: '정상 (fake-plan-1)', render: () => <PlanDemo planId="fake-plan-1" /> },
      { label: '빈 계획 (fake-plan-empty)', render: () => <PlanDemo planId="fake-plan-empty" /> },
      { label: '없는 계획 → 실패', render: () => <PlanDemo planId="fake-plan-missing" /> },
    ],
  },
];
