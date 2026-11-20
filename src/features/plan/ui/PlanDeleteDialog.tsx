import ConfirmModal from '@/shared/components/ConfirmModal';

/** confirm: 1차 확인, final: 되돌릴 수 없다는 2차 확인 */
export type PlanDeleteStep = 'confirm' | 'final';

type PlanDeleteDialogProps = {
  step: PlanDeleteStep | null;
  planTitle: string;
  isPending?: boolean;
  /** 삭제에 실패하면 모달을 연 채로 이 문구를 보여줘요 */
  errorMessage?: string;
  onCancel: () => void;
  /** 1차 확인에서 '삭제하기' */
  onNext: () => void;
  /** 2차 확인에서 '삭제하기' */
  onConfirm: () => void;
  isInline?: boolean;
};

// 여행계획 삭제 확인 모달. 되돌릴 수 없어서 두 번 물어요
export default function PlanDeleteDialog({
  step,
  planTitle,
  isPending = false,
  errorMessage,
  onCancel,
  onNext,
  onConfirm,
  isInline = false,
}: PlanDeleteDialogProps) {
  if (step === 'confirm') {
    return (
      <ConfirmModal
        isOpen
        isInline={isInline}
        icon="alert"
        title="정말 삭제할까요?"
        description={`'${planTitle}' 여행계획을 삭제해요.`}
        cancelLabel="아니요"
        confirmLabel="삭제하기"
        onCancel={onCancel}
        onConfirm={onNext}
      />
    );
  }

  return (
    <ConfirmModal
      isOpen={step === 'final'}
      isInline={isInline}
      icon="alert"
      title="삭제하면 되돌릴 수 없어요"
      description={errorMessage ?? '일차별 일정과 동선이 모두 사라져요.'}
      cancelLabel="취소"
      confirmLabel={isPending ? '삭제 중' : '삭제하기'}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isPending={isPending}
      isDismissible={false}
    />
  );
}
