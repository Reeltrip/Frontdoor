import type { Place } from "./place.types";

export type PlaceDraft = {
  name: string;
  location: string;
  tag: string;
};

export const PLACE_EDIT_MAX_LENGTH = {
  name: 40,
  location: 60,
  tag: 20,
} as const;

export function toDraft(place: Place): PlaceDraft {
  return {
    name: place.name,
    location: place.summary[0] ?? "",
    tag: place.tag ?? "",
  };
}

export function applyDraft(place: Place, draft: PlaceDraft): Place {
  const name = draft.name.trim() || place.name;
  const location = draft.location.trim() || place.summary[0] || "";
  const tag = draft.tag.trim();

  return {
    ...place,
    name,
    summary: location ? [location, ...place.summary.slice(1)] : place.summary,
    tag: tag || undefined,
  };
}

export function isDraftChanged(place: Place, draft: PlaceDraft): boolean {
  const next = applyDraft(place, draft);
  return (
    next.name !== place.name ||
    next.summary[0] !== place.summary[0] ||
    next.tag !== place.tag
  );
}
