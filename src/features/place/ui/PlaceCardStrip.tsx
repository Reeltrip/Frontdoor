import { useEffect, useRef } from "react";
import type { Place } from "../model/place.types";
import PlaceCardCompact from "./PlaceCardCompact";
import styles from "./PlaceCardStrip.module.css";

type PlaceCardStripProps = {
  places: Place[];
  selectedId: string | null;
  onSelect: (placeId: string) => void;
  onPick?: (placeId: string) => void;
  isPlanCard?: boolean;
  isWide?: boolean;
  /** 없으면 삭제 버튼을 그리지 않아요 (여행계획 편집처럼 삭제가 없는 화면) */
  onDelete?: (place: Place) => void;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  /** 여행계획에서 확정한 카드면 알약 글자와 동작을 돌려줘요. 아니면 undefined */
  getNodeActions?: (place: Place) => PlaceNodeActions | undefined;
};

export type PlaceNodeActions = {
  planBLabel: string;
  onPlanB: () => void;
  onRemove: () => void;
};

const SETTLE_MS = 120;

export default function PlaceCardStrip({
  places,
  selectedId,
  onSelect,
  onPick,
  isPlanCard = false,
  isWide = false,
  onDelete,
  onOpen,
  onCopy,
  getNodeActions,
}: PlaceCardStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<number>(undefined);

  useEffect(() => {
    const index = places.findIndex((place) => place.id === selectedId);
    if (index < 0) return;
    const scroller = scrollerRef.current;
    const item = scroller?.children[index] as HTMLElement | undefined;
    const first = scroller?.firstElementChild as HTMLElement | null;
    if (item && first)
      scroller?.scrollTo({
        left: item.offsetLeft - first.offsetLeft,
        behavior: "instant",
      });
  }, [places, selectedId]);

  useEffect(() => () => window.clearTimeout(settleTimerRef.current), []);

  const handleScroll = () => {
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const items = Array.from(scroller.children) as HTMLElement[];
      const start = items[0]?.offsetLeft ?? 0;
      const index = items.reduce(
        (nearest, item, i) =>
          Math.abs(item.offsetLeft - start - scroller.scrollLeft) <
          Math.abs(items[nearest].offsetLeft - start - scroller.scrollLeft)
            ? i
            : nearest,
        0,
      );
      const place = places[index];
      if (place && place.id !== selectedId) onSelect(place.id);
    }, SETTLE_MS);
  };

  return (
    <div
      ref={scrollerRef}
      className={`${styles.strip} ${isPlanCard ? styles.planStrip : ""} ${isWide ? styles.wideStrip : ""}`}
      onScroll={handleScroll}
    >
      {places.map((place) => {
        const nodeActions = getNodeActions?.(place);
        return (
          <div key={place.id} className={styles.item}>
            <PlaceCardCompact
              place={place}
              className={isPlanCard ? styles.planCard : undefined}
              onPick={onPick && ((picked) => onPick(picked.id))}
              onOpen={onOpen}
              onCopy={onCopy}
              onDelete={onDelete}
              planBLabel={nodeActions?.planBLabel}
              onPlanB={nodeActions?.onPlanB}
              onRemove={nodeActions?.onRemove}
            />
          </div>
        );
      })}
    </div>
  );
}
