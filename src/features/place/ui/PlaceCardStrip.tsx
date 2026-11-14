import { useEffect, useRef } from "react";
import trashIcon from "@/shared/assets/icons/trash-compact.svg";
import type { Place } from "../model/place.types";
import PlaceCardCompact from "./PlaceCardCompact";
import styles from "./PlaceCardStrip.module.css";

type PlaceCardStripProps = {
  places: Place[];
  selectedId: string | null;
  onSelect: (placeId: string) => void;
  onDelete: (place: Place) => void;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
};

const ITEM_STEP_PX = 320;
const SETTLE_MS = 120;

export default function PlaceCardStrip({
  places,
  selectedId,
  onSelect,
  onDelete,
  onOpen,
  onCopy,
}: PlaceCardStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<number>(undefined);

  useEffect(() => {
    const index = places.findIndex((place) => place.id === selectedId);
    if (index < 0) return;
    scrollerRef.current?.scrollTo({
      left: index * ITEM_STEP_PX,
      behavior: "smooth",
    });
  }, [places, selectedId]);

  useEffect(() => () => window.clearTimeout(settleTimerRef.current), []);

  const handleScroll = () => {
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const index = Math.min(
        Math.max(Math.round(scroller.scrollLeft / ITEM_STEP_PX), 0),
        places.length - 1,
      );
      const place = places[index];
      if (place && place.id !== selectedId) onSelect(place.id);
    }, SETTLE_MS);
  };

  return (
    <div ref={scrollerRef} className={styles.strip} onScroll={handleScroll}>
      {places.map((place) => (
        <div key={place.id} className={styles.item}>
          <PlaceCardCompact place={place} onOpen={onOpen} onCopy={onCopy} />
          {}
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onDelete(place)}
            aria-label={`${place.name} 삭제`}
          >
            <img src={trashIcon} alt="" />
          </button>
        </div>
      ))}
    </div>
  );
}
