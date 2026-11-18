import { type KeyboardEvent } from "react";
import { useDragStepper } from "@/shared/hooks/useDragStepper";
import { CATEGORIES } from "../lib/categories";
import type { ResultCategoryItem } from "../model/result.types";
import styles from "./CategoryDial.module.css";
import arrowPrevIcon from "@/shared/assets/icons/dial-arrow-prev.svg";
import arrowNextIcon from "@/shared/assets/icons/dial-arrow-next.svg";

type CategoryDialProps = {
  items: ResultCategoryItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  isRaised?: boolean;
  isTickHidden?: boolean;
  variant?: "default" | "summary";
  hasGlow?: boolean;
  isArrowGuide?: boolean;
};

const DRAG_STEP_PX = 90;
const TICKS_PER_STEP = 12;
const TICK_COUNT = 156;
const TICK_DEG = 360 / TICK_COUNT;
const STEP_DEG = TICK_DEG * TICKS_PER_STEP;
const RING_RADIUS = 252;
const TICK_LENGTH = 16.85;
// 카테고리 하나 = 굵은 눈금 한 칸. 얼마나 돌려야 다음 카테고리인지 보이게 길고 진하게 그려요
const MAJOR_TICK_LENGTH = 34;

const TICKS = Array.from({ length: TICK_COUNT }, (_, index) => ({
  angle: index * TICK_DEG,
  isMajor: index % TICKS_PER_STEP === 0,
  length: index % TICKS_PER_STEP === 0 ? MAJOR_TICK_LENGTH : TICK_LENGTH,
}));

export default function CategoryDial({
  items,
  activeIndex,
  onChange,
  isRaised = false,
  isTickHidden = false,
  variant = "default",
  hasGlow = false,
  isArrowGuide = false,
}: CategoryDialProps) {
  const { position, isDragging, handlers } = useDragStepper({
    count: items.length,
    index: activeIndex,
    onChange,
    stepPx: DRAG_STEP_PX,
  });

  const activeItem = items[activeIndex];
  const icon = activeItem ? CATEGORIES[activeItem.category].icon : undefined;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") onChange(Math.max(activeIndex - 1, 0));
    if (event.key === "ArrowRight")
      onChange(Math.min(activeIndex + 1, items.length - 1));
  };

  return (
    <div
      className={[
        styles.dial,
        isRaised && styles.raised,
        isTickHidden && styles.tickHidden,
        variant === "summary" && styles.summary,
        hasGlow && styles.glow,
        isArrowGuide && styles.arrowGuide,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label="카테고리 다이얼"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      <div className={styles.ringMask} aria-hidden>
        <svg
          className={`${styles.ring} ${isDragging ? "" : styles.animated}`}
          style={{ transform: `rotate(${-position * STEP_DEG}deg)` }}
          viewBox={`0 0 ${RING_RADIUS * 2} ${RING_RADIUS * 2}`}
        >
          {TICKS.map(({ angle, length, isMajor }) => (
            <line
              key={angle}
              className={isMajor ? styles.majorTick : undefined}
              x1={RING_RADIUS}
              y1={TICK_LENGTH - length}
              x2={RING_RADIUS}
              y2={TICK_LENGTH}
              transform={`rotate(${angle} ${RING_RADIUS} ${RING_RADIUS})`}
            />
          ))}
        </svg>
      </div>

      <span className={styles.indicator} aria-hidden />
      <div className={styles.bowl} aria-hidden />

      {activeItem && (
        <div className={styles.content} key={activeItem.id}>
          {icon && (
            <img
              src={icon.src}
              alt=""
              className={[styles.icon, icon.isFlipped && styles.flipped]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          <p className={styles.label} aria-live="polite">
            {activeItem.title}
          </p>
        </div>
      )}

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => onChange(activeIndex - 1)}
        disabled={activeIndex <= 0}
        aria-label="이전 카테고리"
      >
        <img src={arrowPrevIcon} alt="" />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => onChange(activeIndex + 1)}
        disabled={activeIndex >= items.length - 1}
        aria-label="다음 카테고리"
      >
        <img src={arrowNextIcon} alt="" />
      </button>
    </div>
  );
}
