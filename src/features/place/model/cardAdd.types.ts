import type { PlaceCategory } from "./place.types";

export type CardAddDraft = {
  category: PlaceCategory;
  name: string;
  address: string;
};

export type CardAddStep = "category" | "name" | "address";

export const CARD_ADD_STEPS: CardAddStep[] = ["category", "name", "address"];
export const PLACE_NAME_MAX_LENGTH = 50;
