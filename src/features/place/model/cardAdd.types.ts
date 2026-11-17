import type { PlaceCategory } from "./place.types";

export type CardFeatures = {
  /** 미리보기용 주소 (이 기기 안에서만 보이는 blob 주소) */
  photoUrl: string | null;
  /** 저장할 때 서버에 올릴 사진 파일 */
  photoFile: File | null;
  tags: string[];
  price: string;
  memo: string;
};

export const EMPTY_CARD_FEATURES: CardFeatures = {
  photoUrl: null,
  photoFile: null,
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
// 서버가 핵심 포인트를 3개까지만 받아요
export const FEATURE_TAG_MAX_COUNT = 3;
