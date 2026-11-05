import { CATEGORIES } from '../lib/categories';
import type { PlaceCategory } from '../model/place.types';
import styles from './CategoryChip.module.css';

type CategoryChipProps = {
  category: PlaceCategory;
  isSelected: boolean;
  onClick?: () => void;
};

// 보관함·여행계획 상단의 카테고리 필터 칩
export default function CategoryChip({ category, isSelected, onClick }: CategoryChipProps) {
  const { label, icon } = CATEGORIES[category];

  return (
    <button
      type="button"
      className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      {icon && (
        <span className={styles.iconBox}>
          <img src={isSelected ? icon.active : icon.default} alt="" />
        </span>
      )}
      {label}
    </button>
  );
}
