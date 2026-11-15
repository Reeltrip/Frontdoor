import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
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

  const dragRef = useRef<{
    startX: number;
    startScrollLeft: number;
    isDragging: boolean;
  } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !barRef.current)
      return;
    dragRef.current = {
      startX: event.clientX,
      startScrollLeft: barRef.current.scrollLeft,
      isDragging: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const bar = barRef.current;
    if (!drag || !bar) return;
    const delta = event.clientX - drag.startX;
    if (!drag.isDragging && Math.abs(delta) < 5) return;
    if (!drag.isDragging) {
      drag.isDragging = true;
      bar.setPointerCapture(event.pointerId);
    }
    bar.scrollLeft = drag.startScrollLeft - delta;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (bar?.hasPointerCapture(event.pointerId))
      bar.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaX === 0 && barRef.current)
      barRef.current.scrollLeft += event.deltaY;
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
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
