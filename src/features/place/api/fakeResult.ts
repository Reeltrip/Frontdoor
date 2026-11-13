import type { ResultCategoryItem } from "../model/result.types";

// 가짜 데이터: 요약카드 결과 응답 형식이 정해지면 서버 호출로 교체
export const FAKE_RESULT_REGION = "후쿠오카";
export const FAKE_RESULT_INITIAL_INDEX = 2;

export const FAKE_RESULT_CATEGORIES: ResultCategoryItem[] = [
  {
    id: "fake-tip",
    category: "tip",
    title: "팁",
    description: "후쿠오카 여행 팁",
  },
  {
    id: "fake-accommodation",
    category: "accommodation",
    title: "숙소",
    description: "니시테츠 호텔 크룸 하카타",
  },
  {
    id: "fake-shopping",
    category: "shopping",
    title: "쇼핑, 대표 상품",
    description: "후쿠오카 PARCO",
  },
  {
    id: "fake-food",
    category: "food",
    title: "맛집, 대표 메뉴",
    description: "식사 위주의 음식점",
  },
  {
    id: "fake-cafe",
    category: "cafe",
    title: "카페, 대표 메뉴",
    description: "미누 커피 다이묘점",
  },
  {
    id: "fake-activity",
    category: "activity",
    title: "액티비티",
    description: "나카스 리버 크루즈",
  },
  {
    id: "fake-attraction",
    category: "attraction",
    title: "관광지",
    description: "후쿠오카 타워",
  },
];
