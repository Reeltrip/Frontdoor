import { useEffect, useId, useRef } from 'react';
import linkIcon from '@/shared/assets/icons/modal-link.svg';
import alertIcon from '@/shared/assets/icons/modal-alert.svg';
import ticketIcon from '@/shared/assets/icons/modal-ticket.svg';
import logoutIcon from '@/shared/assets/icons/modal-logout.svg';
import Button from '@/shared/components/Button';
import styles from './ConfirmModal.module.css';

type ConfirmModalProps = {
  isOpen: boolean;
  icon: 'link' | 'alert' | 'ticket' | 'logout';
  presentation?: 'default' | 'account';
  isPending?: boolean;
  /** dark: 검은 배경 (여행 계획 완성 안내) */
  theme?: 'light' | 'dark';
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** 화면 위에 띄우지 않고 그 자리에 그릴 때 (컴포넌트 테스트 페이지용) */
  isInline?: boolean;
  /** false면 바깥을 누르거나 Esc를 눌러도 닫히지 않아요. '아니요'가 삭제·복구처럼 되돌리기 어려운 일을 할 때 써요 */
  isDismissible?: boolean;
};

// 아이콘 + 제목 + 설명 + 버튼 두 개짜리 확인 창
export default function ConfirmModal({
  isOpen,
  icon,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  isInline = false,
  isDismissible = true,
  theme = 'light',
  presentation = 'default',
  isPending = false,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isInline || !isDismissible || isPending) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isInline, isDismissible, isPending, onCancel]);

  if (!isOpen) return null;

  const dialog = (
    <div
      ref={dialogRef}
      className={[styles.dialog, theme === 'dark' && styles.dark, presentation === 'account' && styles.account, presentation === 'account' && !description && styles.withoutDescription].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal={!isInline}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isPending}
      onKeyDown={(event) => {
        if (presentation !== 'account' || isInline || event.key !== 'Tab') return;
        const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) { event.preventDefault(); return; }
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
    >
      <div className={styles.iconBox}>
        {icon === 'alert' ? (
          <img src={alertIcon} alt="" className={styles.alertIcon} />
        ) : (
          <img src={icon === 'link' ? linkIcon : icon === 'logout' ? logoutIcon : ticketIcon} alt="" />
        )}
      </div>
      <p id={titleId} className={styles.title}>
        {title}
      </p>
      {description && <p id={descriptionId} className={styles.description}>{description}</p>}
      <div className={styles.actions}>
        <Button variant="outline" size="md" className={styles.cancelButton} onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button variant="filled" size="md" onClick={onConfirm} disabled={isPending} autoFocus={!isInline}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );

  if (isInline) return dialog;

  return (
    <div className={`${styles.overlay} ${presentation === 'account' ? styles.accountOverlay : ''}`} onClick={isDismissible && !isPending ? onCancel : undefined}>
      <div onClick={(event) => event.stopPropagation()}>{dialog}</div>
    </div>
  );
}
