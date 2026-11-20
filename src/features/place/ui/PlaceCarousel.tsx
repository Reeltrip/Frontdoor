import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
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
  renderCard?: (place: Place, isActive: boolean) => ReactNode;
  isLocked?: boolean;
};

const DRAG_STEP_PX = 180;
const SPACING_X = 284;
const DROP_Y = 70;
const TILT = 20;
const FADE_PER_STEP = 0.3;

function getSlotStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  const clamped = Math.max(-2.5, Math.min(2.5, offset));

  return {
    transform: `translate(${offset * SPACING_X}px, ${DROP_Y * clamped * clamped}px) rotate(${offset * TILT}deg)`,
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
  renderCard,
  isLocked = false,
}: PlaceCarouselProps) {
  const [turn, setTurn] = useState(0);
  const count = places.length;
  const isLooping = count >= 3;
  // 첫 카드와 마지막 카드 사이를 넘겨도 화면 위 카드의 이동 방향을 유지해요.
  const activeSlot = isLooping ? activeIndex + turn * count : activeIndex;
  const getPlaceIndex = (slot: number) => ((slot % count) + count) % count;
  const selectSlot = (slot: number) => {
    if (!isLooping && (slot < 0 || slot >= count)) return;
    if (isLooping) setTurn(Math.floor(slot / count));
    onChange(getPlaceIndex(slot));
  };

  const { position, isDragging, handlers } = useDragStepper({
    count,
    index: activeSlot,
    onChange: (_, slot) => selectSlot(slot),
    stepPx: DRAG_STEP_PX,
    loop: isLooping,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isLocked) return;
    if (event.key === "ArrowLeft") selectSlot(activeSlot - 1);
    if (event.key === "ArrowRight") selectSlot(activeSlot + 1);
  };

  const nearestSlot = Math.round(position);
  const slots = isLooping
    ? Array.from({ length: 5 }, (_, index) => nearestSlot - 2 + index)
    : places.map((_, index) => index);

  return (
    <div
      className={styles.stage}
      role="group"
      aria-roledescription="carousel"
      aria-label="요약 카드"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...(isLocked ? {} : handlers)}
    >
      {slots.map((slot) => {
        const place = places[getPlaceIndex(slot)];
        const isActive = slot === activeSlot;

        return (
          <div
            key={`${slot}:${place.id}`}
            className={`${styles.slot} ${isDragging ? "" : styles.animated}`}
            style={getSlotStyle(slot - position)}
            onClick={() => !isActive && !isLocked && selectSlot(slot)}
          >
            <div inert={!isActive}>
              {renderCard?.(place, isActive) ?? (
                <PlaceCard
                  place={place}
                  onOpen={onOpen}
                  onCopy={onCopy}
                  onAddMemo={onAddMemo}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
