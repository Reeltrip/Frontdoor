import { useEffect, useRef, useState } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);

  const updateHasMore = () => {
    const bar = barRef.current;
    if (!bar) return;
    setHasMore(bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 1);
  };

  useEffect(() => {
    updateHasMore();
    window.addEventListener("resize", updateHasMore);
    return () => window.removeEventListener("resize", updateHasMore);
  }, []);

  return (
    <div className={`${styles.wrapper} ${hasMore ? styles.hasMore : ""}`}>
      <div
        ref={barRef}
        className={styles.bar}
        role="group"
        aria-label="카테고리 필터"
        onScroll={updateHasMore}
      >
        {(["all", ...FILTER_CATEGORY_KEYS] as const).map((category) => (
          <CategoryChip
            key={category}
            category={category}
            isSelected={category === selected}
            onClick={() => onChange(category)}
          />
        ))}
      </div>
    </div>
  );
}
