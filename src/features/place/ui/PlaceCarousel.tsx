import { type CSSProperties, type KeyboardEvent } from "react";
import { useDragStepper } from "@/shared/hooks/useDragStepper";
import type { Place } from "../model/place.types";
import PlaceCard from "./PlaceCard";
import styles from "./PlaceCarousel.module.css";

type PlaceCarouselProps = {
  places: Place[];
  activeIndex: number;
  onChange: (index: number) => void;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  onAddMemo?: (place: Place) => void;
};

const DRAG_STEP_PX = 180;
const SPACING_X = 282;
const DROP_Y = 60;
const TILT = 0.28;
const FADE_PER_STEP = 0.12;

function getSlotStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  const clamped = Math.max(-2.5, Math.min(2.5, offset));

  return {
    transform: `translate(${offset * SPACING_X}px, ${DROP_Y * clamped * clamped}px) rotate(${offset * TILT}rad)`,
    opacity: Math.max(0, 1 - distance * FADE_PER_STEP),
    zIndex: 10 - Math.round(distance * 2),
    pointerEvents: distance > 2.5 ? "none" : undefined,
  };
}

export default function PlaceCarousel({
  places,
  activeIndex,
  onChange,
  onOpen,
  onCopy,
  onAddMemo,
}: PlaceCarouselProps) {
  const { position, isDragging, handlers } = useDragStepper({
    count: places.length,
    index: activeIndex,
    onChange,
    stepPx: DRAG_STEP_PX,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") onChange(Math.max(activeIndex - 1, 0));
    if (event.key === "ArrowRight")
      onChange(Math.min(activeIndex + 1, places.length - 1));
  };

  return (
    <div
      className={styles.stage}
      role="group"
      aria-roledescription="carousel"
      aria-label="요약 카드"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      {places.map((place, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={place.id}
            className={`${styles.slot} ${isDragging ? "" : styles.animated}`}
            style={getSlotStyle(index - position)}
            onClick={() => !isActive && onChange(index)}
            inert={!isActive}
          >
            <PlaceCard
              place={place}
              onOpen={onOpen}
              onCopy={onCopy}
              onAddMemo={onAddMemo}
            />
          </div>
        );
      })}
    </div>
  );
}
