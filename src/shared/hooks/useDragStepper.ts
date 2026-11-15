import { useRef, useState, type MouseEvent, type PointerEvent } from "react";

type UseDragStepperOptions = {
  count: number;
  index: number;
  onChange: (index: number) => void;
  stepPx: number;
  startPx?: number;
  loop?: boolean;
};

function wrapIndex(value: number, count: number): number {
  return ((value % count) + count) % count;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useDragStepper({
  count,
  index,
  onChange,
  stepPx,
  startPx = 6,
  loop = false,
}: UseDragStepperOptions) {
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const dragPxRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const maxIndex = Math.max(count - 1, 0);
  const position = loop
    ? index - dragPx / stepPx
    : clamp(index - dragPx / stepPx, 0, maxIndex);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startXRef.current = event.clientX;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (startXRef.current === null) return;
    const delta = event.clientX - startXRef.current;

    if (!isDraggingRef.current) {
      if (Math.abs(delta) < startPx) return;
      isDraggingRef.current = true;
      hasDraggedRef.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    dragPxRef.current = delta;
    setDragPx(delta);
  };

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    if (startXRef.current === null) return;
    startXRef.current = null;
    if (!isDraggingRef.current) return;

    const rounded = Math.round(index - dragPxRef.current / stepPx);
    const next = loop ? wrapIndex(rounded, count) : clamp(rounded, 0, maxIndex);
    isDraggingRef.current = false;
    dragPxRef.current = 0;
    setIsDragging(false);
    setDragPx(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (next !== index) onChange(next);
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!hasDraggedRef.current) return;
    hasDraggedRef.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  return {
    position,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClickCapture: handleClickCapture,
    },
  };
}
