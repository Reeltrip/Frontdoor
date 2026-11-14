import sampleFood from "@/shared/assets/images/sample-food.png";
import sampleHotel from "@/shared/assets/images/sample-hotel.jpg";
import sampleDonut from "@/shared/assets/images/sample-donut.jpg";
import type { Place } from "../model/place.types";

// 가짜 데이터: 삭제한 카드 목록 API(GET /places?deleted)가 정해지면 서버 호출로 교체
export const FAKE_TRASH_PLACES: Place[] = [
  {
    id: "fake-trash-1",
    category: "food",
    name: "Shin Shin",
    imageUrl: sampleFood,
    summary: ["돈코츠 라멘"],
  },
  {
    id: "fake-trash-2",
    category: "shopping",
    name: "미나 텐진",
    imageUrl: sampleHotel,
    summary: ["복합 쇼핑몰"],
  },
  {
    id: "fake-trash-3",
    category: "cafe",
    name: "레크 커피 텐진미나미점",
    imageUrl: sampleDonut,
    summary: ["카페"],
  },
  {
    id: "fake-trash-4",
    category: "attraction",
    name: "모모치",
    imageUrl: sampleHotel,
    summary: ["후쿠오카시 박물관, 타워"],
  },
  {
    id: "fake-trash-5",
    category: "food",
    name: "Kawataro Nakasu",
    imageUrl: sampleFood,
    summary: ["활오징어"],
  },
  {
    id: "fake-trash-6",
    category: "shopping",
    name: "후쿠오카 파르코",
    imageUrl: sampleDonut,
    summary: ["복합 쇼핑몰"],
  },
  {
    id: "fake-trash-7",
    category: "attraction",
    name: "오호리 공원",
    imageUrl: sampleHotel,
    summary: ["공원"],
  },
];
