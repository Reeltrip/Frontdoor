// 컴포넌트 테스트 페이지(/dev/components)에서만 쓰는 보기용 카드예요. 앱 화면은 실제 서버 데이터를 써요
import sampleFood from "@/shared/assets/images/sample-food.png";
import sampleDonut from "@/shared/assets/images/sample-donut.jpg";
import type { Place } from "@/features/place/model/place.types";
import type { ResultCategoryItem } from "@/features/place/model/result.types";
import { RESULT_CATEGORIES } from "@/features/place/model/useResultPlaces";

export const DEMO_PLACES: Place[] = [
  {
    id: "demo-place-1",
    category: "food",
    name: "하카타 잇소 (博多一双)",
    imageUrl: sampleFood,
    location: { lat: 33.586388, lng: 130.425186 },
    summary: ["하카타역 동쪽 도보 약 6~7분", "11:00~24:00"],
    tag: "¥960~980",
    reviewCount: 6500,
  },
  {
    id: "demo-place-2",
    category: "food",
    name: "I'm donut? 후쿠오카 텐진점",
    imageUrl: sampleDonut,
    location: { lat: 33.588314, lng: 130.402252 },
    summary: ["텐진역 도보 약 6분"],
    address: "후쿠오카시 주오구 와타나베도리 5-24-30, 1층",
    tag: "¥220~240",
    reviewCount: 1806,
  },
];

export const DEMO_RESULT_CATEGORIES: ResultCategoryItem[] = RESULT_CATEGORIES.map(
  ({ category, title }) => ({
    id: category,
    category,
    title,
    description: "보기용 카드",
  }),
);

export const DEMO_RESULT_INITIAL_INDEX = 3;
