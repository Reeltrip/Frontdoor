import type { PlaceCategory } from "./place.types";

export type CardFeatures = {
  photoUrl: string | null;
  tags: string[];
  price: string;
  memo: string;
};

export const EMPTY_CARD_FEATURES: CardFeatures = {
  photoUrl: null,
  tags: [],
  price: "",
  memo: "",
};

export type CardAddDraft = {
  category: PlaceCategory;
  name: string;
  address: string;
  features: CardFeatures;
};

export type CardAddStep = "category" | "name" | "address" | "features";

export const CARD_ADD_STEPS: CardAddStep[] = [
  "category",
  "name",
  "address",
  "features",
];
export const PLACE_NAME_MAX_LENGTH = 50;
export const FEATURE_TEXT_MAX_LENGTH = 50;
export const FEATURE_TAG_MAX_COUNT = 5;
