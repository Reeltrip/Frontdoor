import dishIcon from '@/shared/assets/icons/dish.svg';
import dishActiveIcon from '@/shared/assets/icons/dish-active.svg';
import cafeIcon from '@/shared/assets/icons/category-cafe.svg';
import attractionIcon from '@/shared/assets/icons/category-attraction.svg';
import accommodationIcon from '@/shared/assets/icons/category-accommodation.svg';
import shoppingIcon from '@/shared/assets/icons/category-shopping.svg';
import tipIcon from '@/shared/assets/icons/category-tip.svg';
import activityIcon from '@/shared/assets/icons/category-activity.svg';
import type { PlaceCategory } from '../model/place.types';

type CategoryIcon = {
  src: string;
  /** 선택됐을 때 쓰는 흰 아이콘. 피그마에 맛집만 따로 있어서 나머지는 CSS로 색을 바꿈 */
  activeSrc?: string;
  /** 피그마에서 상하 반전해서 쓴 아이콘 (숙소) */
  isFlipped?: boolean;
};

type CategoryInfo = {
  label: string;
  /** 교통은 피그마 칩에 없어서 아이콘도 없음 */
  icon?: CategoryIcon;
};

// 한글 이름·아이콘은 피그마 컴포넌트 > chip 기준
export const CATEGORIES: Record<PlaceCategory, CategoryInfo> = {
  food: { label: '맛집', icon: { src: dishIcon, activeSrc: dishActiveIcon } },
  cafe: { label: '카페', icon: { src: cafeIcon } },
  attraction: { label: '관광지', icon: { src: attractionIcon } },
  accommodation: { label: '숙소', icon: { src: accommodationIcon, isFlipped: true } },
  shopping: { label: '쇼핑', icon: { src: shoppingIcon } },
  tip: { label: '팁', icon: { src: tipIcon } },
  activity: { label: '액티비티', icon: { src: activityIcon } },
  transportation: { label: '교통' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as PlaceCategory[];

/** 보관함 상단 필터 칩 순서 (피그마 chip). '전체' 뒤에 붙음 */
export const FILTER_CATEGORY_KEYS: PlaceCategory[] = [
  'food',
  'cafe',
  'attraction',
  'accommodation',
  'shopping',
  'tip',
  'activity',
];
