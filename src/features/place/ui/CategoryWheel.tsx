import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { CATEGORIES } from "../lib/categories";
import type { ResultCategoryItem } from "../model/result.types";
import styles from "./CategoryWheel.module.css";

type CategoryWheelProps = {
  items: ResultCategoryItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  onView: (item: ResultCategoryItem) => void;
};

const DRAG_STEP_PX = 64;

const DRAG_START_PX = 6;

const WHEEL_COOLDOWN_MS = 160;

const WHEEL_RADIUS = 300;
const STEP_ANGLE = 0.24;

const FADE_DISTANCE = 3.5;

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(index, 0), length - 1);
}

function getItemStyle(offset: number): CSSProperties {
  const angle = offset * STEP_ANGLE;
  const x = WHEEL_RADIUS * (1 - Math.cos(angle));
  const y = WHEEL_RADIUS * Math.sin(angle);
  const distance = Math.abs(offset);
  const scale = Math.max(0.6, 1 - distance * 0.1);
  const opacity = Math.max(0, 1 - distance / FADE_DISTANCE);
  const activeness = Math.max(0, 1 - distance);

  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    opacity,
    zIndex: 100 - Math.round(distance * 10),
    pointerEvents: opacity === 0 ? "none" : undefined,
    "--active": activeness,
  } as CSSProperties;
}

export default function CategoryWheel({
  items,
  activeIndex,
  onChange,
  onView,
}: CategoryWheelProps) {
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const lastWheelAtRef = useRef(0);

  const position = activeIndex - dragOffsetPx / DRAG_STEP_PX;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startYRef.current = event.clientY;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const deltaY = event.clientY - startYRef.current;

    if (!isDragging) {
      if (Math.abs(deltaY) < DRAG_START_PX) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      hasDraggedRef.current = true;
    }

    const maxUp = (activeIndex + 0.5) * DRAG_STEP_PX;
    const maxDown = (items.length - 1 - activeIndex + 0.5) * DRAG_STEP_PX;
    setDragOffsetPx(Math.min(Math.max(deltaY, -maxDown), maxUp));
  };

  const finishDrag = () => {
    startYRef.current = null;
    if (!isDragging) return;
    onChange(clampIndex(Math.round(position), items.length));
    setDragOffsetPx(0);
    setIsDragging(false);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (
      Math.abs(event.deltaY) < 8 ||
      now - lastWheelAtRef.current < WHEEL_COOLDOWN_MS
    )
      return;
    lastWheelAtRef.current = now;
    onChange(
      clampIndex(activeIndex + (event.deltaY > 0 ? 1 : -1), items.length),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onChange(clampIndex(activeIndex + 1, items.length));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onChange(clampIndex(activeIndex - 1, items.length));
    }
  };

  const handleRowClick = (index: number) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    onChange(index);
  };

  return (
    <div
      className={styles.wheel}
      role="group"
      aria-label="카테고리 목록. 위아래 방향키로 고를 수 있어요"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const categoryIcon = CATEGORIES[item.category].icon;

        return (
          <div
            key={item.id}
            className={`${styles.item} ${isDragging ? "" : styles.animated}`}
            style={getItemStyle(index - position)}
          >
            <span className={styles.pill} aria-hidden />
            <button
              type="button"
              className={styles.row}
              aria-current={isActive}
              onClick={() => handleRowClick(index)}
            >
              <span className={styles.thumb}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className={styles.photo} />
                )}
                {categoryIcon && (
                  <img src={categoryIcon.src} alt="" className={styles.icon} />
                )}
              </span>
              <span className={styles.text}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.description}>{item.description}</span>
              </span>
            </button>
            <button
              type="button"
              className={styles.viewButton}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              // 선택하지 않은 줄의 보기 버튼은 안 보이므로 누름이 아래 줄로 넘어가게 함
              style={{ pointerEvents: isActive ? "auto" : "none" }}
              onClick={() => onView(item)}
            >
              보기
            </button>
          </div>
        );
      })}
    </div>
  );
}
