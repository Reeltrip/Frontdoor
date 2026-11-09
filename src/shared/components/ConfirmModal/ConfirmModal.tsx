import { useEffect, useId } from 'react';
import linkIcon from '@/shared/assets/icons/modal-link.svg';
import alertIcon from '@/shared/assets/icons/modal-alert.svg';
import ticketIcon from '@/shared/assets/icons/modal-ticket.svg';
import Button from '@/shared/components/Button';
import styles from './ConfirmModal.module.css';

type ConfirmModalProps = {
  isOpen: boolean;
  icon: 'link' | 'alert' | 'ticket';
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
  theme = 'light',
}: ConfirmModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen || isInline) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isInline, onCancel]);

  if (!isOpen) return null;

  const dialog = (
    <div
      className={`${styles.dialog} ${theme === 'dark' ? styles.dark : ''}`}
      role="dialog"
      aria-modal={!isInline}
      aria-labelledby={titleId}
    >
      <div className={styles.iconBox}>
        {icon === 'alert' ? (
          <img src={alertIcon} alt="" className={styles.alertIcon} />
        ) : (
          <img src={icon === 'link' ? linkIcon : ticketIcon} alt="" />
        )}
      </div>
      <p id={titleId} className={styles.title}>
        {title}
      </p>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.actions}>
        <Button variant="outline" size="md" className={styles.cancelButton} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="filled" size="md" onClick={onConfirm} autoFocus={!isInline}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );

  if (isInline) return dialog;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div onClick={(event) => event.stopPropagation()}>{dialog}</div>
    </div>
  );
}
