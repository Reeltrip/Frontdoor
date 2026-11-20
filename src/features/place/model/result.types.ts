import type { PlaceCategory } from "./place.types";

export type ResultCategoryItem = {
  id: string;
  category: PlaceCategory;
  title: string;
  description: string;
  imageUrl?: string;
  /** 대표 카드의 Google 장소 ID. 있으면 휠 사진을 Google 장소 사진으로 보여줘요 (#193) */
  googlePlaceId?: string;
};
