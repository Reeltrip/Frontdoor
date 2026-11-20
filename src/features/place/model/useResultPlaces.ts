import { useState } from "react";
import type { Place, PlaceCategory } from "./place.types";
import type { ResultCategoryItem } from "./result.types";
import { readLastResult } from "./lastResult";
import { usePlaces } from "./usePlaces";

/** 결과 휠·다이얼의 카테고리 순서와 제목 (피그마 요약카드 결과) */
export const RESULT_CATEGORIES: { category: PlaceCategory; title: string }[] = [
  { category: "tip", title: "팁" },
  { category: "accommodation", title: "숙소" },
  { category: "shopping", title: "쇼핑, 대표 상품" },
  { category: "food", title: "맛집, 대표 메뉴" },
  { category: "cafe", title: "카페, 대표 메뉴" },
  { category: "activity", title: "액티비티" },
  { category: "attraction", title: "관광지" },
];

const EMPTY_DESCRIPTION = "아직 카드가 없어요";

// 휠에 교통 칸이 따로 없어서 교통 카드는 팁과 같이 보여줘요
const toWheelCategory = (category: PlaceCategory): PlaceCategory =>
  category === "transportation" ? "tip" : category;

/**
 * 결과·카드 보기 화면에 보여줄 카드. 방금 분석한 결과가 있으면 그 카드만, 없으면 보관함 전체예요.
 * 방금 만든 카드를 모두 지웠을 때도 보관함 전체를 보여줘요.
 */
export function useResultPlaces() {
  const [lastResult] = useState(readLastResult);
  const { places, viewStatus, error, refetch } = usePlaces();

  const lastIds = new Set(lastResult?.placeIds ?? []);
  const lastPlaces = places.filter((place) => lastIds.has(place.id));
  const isLastResult = lastPlaces.length > 0;
  const shownPlaces = isLastResult ? lastPlaces : places;

  const placesByCategory: Partial<Record<PlaceCategory, Place[]>> = {};
  shownPlaces.forEach((place) => {
    const key = toWheelCategory(place.category);
    (placesByCategory[key] ??= []).push(place);
  });

  // 한 링크에서 만든 카드들이 같은 원본 썸네일을 받을 수 있어요.
  // 카테고리 대표 사진은 앞 카테고리에서 쓰지 않은 사진을 먼저 골라 반복을 피해요.
  const usedImageUrls = new Set<string>();
  const items: ResultCategoryItem[] = RESULT_CATEGORIES.map(
    ({ category, title }) => {
      const categoryPlaces = placesByCategory[category] ?? [];
      const first = categoryPlaces[0];
      const imageUrl = categoryPlaces.find(
        (place) => place.imageUrl && !usedImageUrls.has(place.imageUrl),
      )?.imageUrl;
      if (imageUrl) usedImageUrls.add(imageUrl);
      return {
        id: category,
        category,
        title,
        description: first?.name ?? EMPTY_DESCRIPTION,
        ...(imageUrl ? { imageUrl } : {}),
        // 설명에 이름이 나오는 첫 카드의 Google 사진을 써요
        ...(first?.googlePlaceId ? { googlePlaceId: first.googlePlaceId } : {}),
      };
    },
  );

  // 처음에는 카드가 가장 많은 카테고리를 가운데에 둬요
  const initialIndex = items.reduce(
    (best, item, index) =>
      (placesByCategory[item.category]?.length ?? 0) >
      (placesByCategory[items[best].category]?.length ?? 0)
        ? index
        : best,
    0,
  );

  return {
    title: (isLastResult && lastResult?.title) || "보관함",
    items,
    placesByCategory,
    initialIndex,
    viewStatus,
    error,
    refetch,
  };
}
