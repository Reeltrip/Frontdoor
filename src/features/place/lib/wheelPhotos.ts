import foodPhoto from "@/shared/assets/images/result/food.png";
import cafePhoto from "@/shared/assets/images/result/cafe.png";
import shoppingPhoto from "@/shared/assets/images/result/shopping.png";
import accommodationPhoto from "@/shared/assets/images/result/accommodation.png";
import attractionPhoto from "@/shared/assets/images/result/attraction.png";
import type { PlaceCategory } from "../model/place.types";

// Figma 174:727의 사진 배경이에요. 숙소·액티비티, 팁·관광지는 같은 사진을 써요.
export const WHEEL_PHOTOS: Record<PlaceCategory, string> = {
  food: foodPhoto,
  cafe: cafePhoto,
  shopping: shoppingPhoto,
  accommodation: accommodationPhoto,
  activity: accommodationPhoto,
  attraction: attractionPhoto,
  tip: attractionPhoto,
  transportation: attractionPhoto,
};
