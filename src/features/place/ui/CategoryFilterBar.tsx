import { FILTER_CATEGORY_KEYS } from "../lib/categories";
import type { PlaceCategory } from "../model/place.types";
import CategoryChip from "./CategoryChip";
import styles from "./CategoryFilterBar.module.css";

type CategoryFilterBarProps = {
  selected: PlaceCategory | "all";
  onChange: (category: PlaceCategory | "all") => void;
};

export default function CategoryFilterBar({
  selected,
  onChange,
}: CategoryFilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="카테고리 필터">
      {(["all", ...FILTER_CATEGORY_KEYS] as const).map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={category === selected}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  );
}
