import { useState } from "react";
import type { LinkRow } from "./source.types";

export const INITIAL_LINK_COUNT = 4;

export function isLinkValid(value: string): boolean {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function useLinkForm(initialLink = "") {
  const [rows, setRows] = useState<LinkRow[]>(() =>
    Array.from({ length: INITIAL_LINK_COUNT }, (_, index) => ({
      id: index,
      value: index === 0 ? initialLink : "",
    })),
  );
  const [nextId, setNextId] = useState(INITIAL_LINK_COUNT);

  const filledLinks = rows
    .map((row) => row.value.trim())
    .filter((value) => value !== "");

  const canSubmit = filledLinks.length > 0 && filledLinks.every(isLinkValid);

  const changeRow = (id: number, value: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, value } : row)),
    );
  };

  const removeRow = (id: number) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setRows((current) => [...current, { id: nextId, value: "" }]);
    setNextId((current) => current + 1);
  };

  return {
    rows,
    filledLinks,
    canSubmit,
    changeRow,
    removeRow,
    addRow,
  };
}
