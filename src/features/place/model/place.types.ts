export type PlaceCategory =
  | "food"
  | "accommodation"
  | "cafe"
  | "shopping"
  | "attraction"
  | "transportation"
  | "tip"
  | "activity";

export type Place = {
  id: string;
  category: PlaceCategory;
  name: string;
  imageUrl: string;
  summary: string[];
  address?: string;
  tag?: string;
  reviewCount?: number;
};
