// 기능명세서 5. 예외 상황 처리의 안내 문구. 문구를 바꿀 때는 이 파일만 고쳐요.
// ConfirmModal에 그대로 펼쳐 넣어요: <ConfirmModal {...EXCEPTION_MODALS.duplicateSource} ... />

type ExceptionModalCopy = {
  icon: 'link' | 'alert' | 'ticket';
  title: string;
  cancelLabel: string;
  confirmLabel: string;
};

export const EXCEPTION_MODALS = {
  /** 5-1 중복된 링크 붙여넣기 */
  duplicateSource: {
    icon: 'link',
    title: '이전에 수집한 적 있는 링크예요. 다시 수집할까요?',
    cancelLabel: '아니요',
    confirmLabel: '네',
  },
  /** 5-2 보관함에 이미 있는 장소 */
  duplicatePlace: {
    icon: 'alert',
    title: '이전에 존재하는 노드가 있어요. 새로운 카드로 수정할까요?',
    cancelLabel: '아니요',
    confirmLabel: '네',
  },
  /** 5-3 같은 기간에 새 여행계획 만들기 */
  planPeriodOverlap: {
    icon: 'alert',
    title: '선택한 기간 내에 다른 계획이 존재해요. 계획을 생성하시겠어요?',
    cancelLabel: '아니요',
    confirmLabel: '네',
  },
  /** 5-3 계획에 넣은 카드를 삭제한 경우 */
  deletedPlaceInPlan: {
    icon: 'alert',
    title: '삭제된 장소가 있어요. 노드를 삭제할까요?',
    cancelLabel: '아니요, 복구할래요',
    confirmLabel: '네',
  },
} as const satisfies Record<string, ExceptionModalCopy>;

/** 5-4 기간을 줄일 때 남길 일차 선택 창 */
export const KEEP_DAYS_MESSAGES = {
  title: '남기고 싶은 일정을 선택해 주세요',
  getDescription: (keepCount: number) => `기간이 ${keepCount}일로 줄어요. 남길 일정 ${keepCount}개를 골라 주세요.`,
  emptyDay: '비어 있는 일차',
  cancelLabel: '취소',
  confirmLabel: '확인',
} as const;
