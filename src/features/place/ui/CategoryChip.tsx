import { CATEGORIES } from '../lib/categories';
import type { PlaceCategory } from '../model/place.types';
import styles from './CategoryChip.module.css';

type CategoryChipProps = {
  /** 'all'은 아이콘 없는 '전체' 칩 */
  category: PlaceCategory | 'all';
  isSelected: boolean;
  onClick?: () => void;
};

// 보관함·여행계획 상단의 카테고리 필터 칩
export default function CategoryChip({ category, isSelected, onClick }: CategoryChipProps) {
  const { label, icon } = category === 'all' ? { label: '전체', icon: undefined } : CATEGORIES[category];
  const iconSrc = isSelected && icon?.activeSrc ? icon.activeSrc : icon?.src;
  // 따로 받은 선택용 아이콘이 없으면 CSS 필터로 색을 맞춤
  const isTinted = Boolean(icon && !icon.activeSrc);

  return (
    <button
      type="button"
      className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      {icon && (
        <span className={styles.iconBox}>
          <img
            src={iconSrc}
            alt=""
            className={[isTinted && styles.tinted, icon.isFlipped && styles.flipped]
              .filter(Boolean)
              .join(' ')}
          />
        </span>
      )}
      {label}
    </button>
  );
}
