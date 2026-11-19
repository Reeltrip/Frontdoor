import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

/** 이만큼(px) 끌어야 펼치거나 접어요. 손가락이 조금 흔들린 건 무시해요 */
const SNAP_DISTANCE = 40;
/** 이보다 적게 움직이면 끈 게 아니라 누른 거예요 */
const TAP_DISTANCE = 6;

/** 끈 거리(dy, 아래로 +)를 보고 펼칠지 정해요 */
export function decideSheetExpanded(isExpanded: boolean, dy: number): boolean {
  if (dy <= -SNAP_DISTANCE) return true;
  if (dy >= SNAP_DISTANCE) return false;
  return isExpanded;
}

/** 끄는 동안 시트 높이. 접힌 높이와 펼친 높이 사이로만 움직여요 */
export function getDraggingHeight({ isExpanded, dy, collapsed, expanded }: {
  isExpanded: boolean;
  dy: number;
  collapsed: number;
  expanded: number;
}): number {
  const start = isExpanded ? expanded : collapsed;
  return Math.min(expanded, Math.max(collapsed, start - dy));
}

type DragState = { startY: number; dy: number; collapsed: number; expanded: number };

/**
 * 아래 시트를 손잡이·제목 줄로 끌어서 펼치고 접어요. 누르기만 하면 펼치기·접기를 바꿔요.
 * 펼친 높이는 부모 높이에서 topGap을 뺀 값이에요 (지도를 조금 남겨 둬요)
 */
export function useSheetDrag({ collapsedHeight, topGap }: { collapsedHeight: number; topGap: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const drag = useRef<DragState | null>(null);

  // 버튼(계획 수정 등)은 끌기와 상관없이 그대로 눌리게 둬요
  const isOnControl = (event: PointerEvent<HTMLElement>) =>
    event.target instanceof Element && event.target.closest('button:not([data-sheet-handle]), a') !== null;

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isOnControl(event)) return;
    const sheet = event.currentTarget.closest<HTMLElement>('[data-sheet]');
    const parentHeight = sheet?.parentElement?.clientHeight ?? 0;
    const collapsed = Math.min(collapsedHeight, parentHeight);
    drag.current = { startY: event.clientY, dy: 0, collapsed, expanded: Math.max(collapsed, parentHeight - topGap) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    current.dy = event.clientY - current.startY;
    if (Math.abs(current.dy) < TAP_DISTANCE) return;
    setDragHeight(getDraggingHeight({ isExpanded, dy: current.dy, collapsed: current.collapsed, expanded: current.expanded }));
  };

  const finish = (isCancelled: boolean) => {
    const current = drag.current;
    drag.current = null;
    setDragHeight(null);
    if (!current || isCancelled) return;
    if (Math.abs(current.dy) < TAP_DISTANCE) setIsExpanded((value) => !value);
    else setIsExpanded(decideSheetExpanded(isExpanded, current.dy));
  };

  return {
    isExpanded,
    /** 키보드로 손잡이를 눌렀을 때 */
    toggle: () => setIsExpanded((value) => !value),
    isDragging: dragHeight !== null,
    /** 끄는 동안만 높이를 직접 정해요. 놓으면 CSS(접힘·펼침)로 돌아가요 */
    sheetStyle: (dragHeight === null ? undefined : { height: dragHeight }) as CSSProperties | undefined,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: () => finish(false),
      onPointerCancel: () => finish(true),
    },
  };
}
