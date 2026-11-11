// 기능명세서 5. 예외 상황 처리 데모. 팀원 브랜치와 demos.tsx 충돌을 피하려고 따로 둠
import type { ComponentDemo } from './demos';
import {
  ChangePeriodDemo,
  CollectLinksDemo,
  CreatePlanDemo,
  DeletedPlaceInPlanDemo,
  EmptyFieldsCard,
  ExceptionModalPreview,
  KeepDaysPreview,
} from './ExceptionWidgets';

export const exceptionDemos: ComponentDemo[] = [
  {
    name: '예외 안내 문구',
    path: 'shared/lib/exceptionMessages.ts',
    description: '문구는 이 파일 한 곳에서 고쳐요',
    variants: [
      { label: '5-1 중복 링크', render: () => <ExceptionModalPreview name="duplicateSource" /> },
      { label: '5-2 이미 있는 장소', render: () => <ExceptionModalPreview name="duplicatePlace" /> },
      { label: '5-3 같은 기간 계획', render: () => <ExceptionModalPreview name="planPeriodOverlap" /> },
      { label: '5-3 삭제된 카드', render: () => <ExceptionModalPreview name="deletedPlaceInPlan" /> },
    ],
  },
  {
    name: '링크 수집 예외',
    path: 'features/source/model/useCollectSources.ts',
    description: '5-1 중복 링크·여러 링크, 5-2 이미 있는 장소·삭제한 카드 다시 만들기',
    variants: [{ label: '링크별 결과', render: () => <CollectLinksDemo /> }],
  },
  {
    name: '빈 항목 표시',
    path: 'shared/lib/displayValue.ts',
    description: "5-2 추출하지 못한 항목은 '-'",
    variants: [
      { label: 'PlaceCard', render: () => <EmptyFieldsCard /> },
      { label: 'PlaceCardCompact', render: () => <EmptyFieldsCard isCompact /> },
    ],
  },
  {
    name: '계획 생성 예외',
    path: 'features/plan/model/usePlan.ts',
    description: '5-3 같은 기간 계획, 카드 0개로 건너뛴 일차',
    variants: [{ label: '계획 만들기', render: () => <CreatePlanDemo /> }],
  },
  {
    name: '삭제된 카드가 든 계획',
    path: 'features/plan/model/useDeletedPlaces.ts',
    description: '5-3 노드 빼고 동선 잇기 / 카드 복구',
    variants: [{ label: 'fake-plan-1', render: () => <DeletedPlaceInPlanDemo /> }],
  },
  {
    name: '기간 변경',
    path: 'features/plan/ui/KeepDaysModal.tsx',
    description: '5-4 줄이면 남길 일차 선택, 늘리면 빈 일차 + 작성 중',
    variants: [
      { label: '남길 일차 선택 창', render: () => <KeepDaysPreview /> },
      { label: 'fake-plan-3days', render: () => <ChangePeriodDemo /> },
    ],
  },
];
