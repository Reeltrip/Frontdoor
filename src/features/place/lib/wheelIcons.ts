import tipIcon from "@/shared/assets/icons/category-tip.svg";
import foodIcon from "@/shared/assets/icons/wheel-food.svg";
import cafeIcon from "@/shared/assets/icons/wheel-cafe.svg";
import attractionIcon from "@/shared/assets/icons/wheel-attraction.svg";
import accommodationIcon from "@/shared/assets/icons/wheel-accommodation.svg";
import shoppingIcon from "@/shared/assets/icons/wheel-shopping.svg";
import activityIcon from "@/shared/assets/icons/wheel-activity.svg";
import type { PlaceCategory } from "../model/place.types";

type WheelIcon = {
  src: string;
  isTinted?: boolean;
  isFlipped?: boolean;
};

export const WHEEL_ICONS: Partial<Record<PlaceCategory, WheelIcon>> = {
  food: { src: foodIcon },
  cafe: { src: cafeIcon },
  attraction: { src: attractionIcon },
  accommodation: { src: accommodationIcon },
  shopping: { src: shoppingIcon },
  activity: { src: activityIcon },
  tip: { src: tipIcon },
};
