import dishIcon from '@/shared/assets/icons/dish.svg';
import dishActiveIcon from '@/shared/assets/icons/dish-active.svg';
import type { PlaceCategory } from '../model/place.types';

type CategoryInfo = {
  label: string;
  /** 피그마에 아이콘이 아직 맛집 것만 있어서 나머지는 비워 둠 */
  icon?: { default: string; active: string };
};

// 한글 이름은 피그마 카드 이름(Food, Accommodation...)을 옮긴 가정. 기획 확정되면 맞추기
export const CATEGORIES: Record<PlaceCategory, CategoryInfo> = {
  food: { label: '맛집', icon: { default: dishIcon, active: dishActiveIcon } },
  accommodation: { label: '숙소' },
  cafe: { label: '카페' },
  shopping: { label: '쇼핑' },
  attraction: { label: '관광지' },
  transportation: { label: '교통' },
  activity: { label: '액티비티' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as PlaceCategory[];
