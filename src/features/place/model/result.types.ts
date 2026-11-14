import type { PlaceCategory } from "./place.types";

export type ResultCategoryItem = {
  id: string;
  category: PlaceCategory;
  title: string;
  description: string;
  imageUrl?: string;
};
