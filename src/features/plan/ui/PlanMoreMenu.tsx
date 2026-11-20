import { useEffect, useRef } from 'react';
import kebabIcon from '@/shared/assets/icons/kebab.svg';
import styles from './PlanMoreMenu.module.css';

type PlanMoreMenuProps = {
  planTitle: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelete: () => void;
  /** photo: 사진 위에 놓는 둥근 흰 버튼 (다가오는 여행 카드) */
  tone?: 'plain' | 'photo';
  className?: string;
};

// 여행계획 ⋮ 메뉴. 보관함·카드 보기의 ⋮ 메뉴와 같은 모양이에요 (피그마 2-14)
export default function PlanMoreMenu({
  planTitle,
  isOpen,
  onOpenChange,
  onDelete,
  tone = 'plain',
  className,
}: PlanMoreMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥을 누르거나 Esc를 누르면 닫아요
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div ref={wrapRef} className={[styles.wrap, isOpen && styles.open, className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={`${styles.moreButton} ${tone === 'photo' ? styles.photo : ''}`}
        aria-label={`${planTitle} 더보기`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
      >
        <img src={kebabIcon} alt="" />
      </button>
      {isOpen && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}
