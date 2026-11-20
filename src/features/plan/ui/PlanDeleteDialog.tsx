import ConfirmModal from '@/shared/components/ConfirmModal';

type PlanDeleteDialogProps = {
  isPending?: boolean;
  /** 삭제에 실패하면 모달을 연 채로 이 문구를 보여줘요 */
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isInline?: boolean;
};

export default function PlanDeleteDialog({
  isPending = false,
  errorMessage,
  onCancel,
  onConfirm,
  isInline = false,
}: PlanDeleteDialogProps) {
  return (
    <ConfirmModal
      isOpen
      isInline={isInline}
      icon="alert"
      presentation="account"
      title="여행목록을 삭제할까요?"
      description={errorMessage ?? '삭제된 내용은 복구되지 않습니다'}
      cancelLabel="그만두기"
      confirmLabel={isPending ? '삭제 중' : '삭제하기'}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
}
