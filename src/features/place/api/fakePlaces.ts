import sampleFood from "@/shared/assets/images/sample-food.png";
import sampleHotel from "@/shared/assets/images/sample-hotel.jpg";
import sampleDonut from "@/shared/assets/images/sample-donut.jpg";
import type { Place, PlaceCategory } from "../model/place.types";

// 가짜 데이터: GET /places 응답 형식이 정해지면 서버 호출로 교체
export const FAKE_PLACES_BY_CATEGORY: Partial<Record<PlaceCategory, Place[]>> =
  {
    food: [
      {
        id: "fake-food-1",
        category: "food",
        name: "하카타 잇소 (博多一双)",
        imageUrl: sampleFood,
        summary: ["하카타역 동쪽 도보 약 6~7분", "11:00~24:00"],
        tag: "¥960~980",
        reviewCount: 6500,
      },
      {
        id: "fake-food-2",
        category: "food",
        name: "텐푸라 히라오 텐진점",
        imageUrl: sampleDonut,
        summary: ["후쿠오카 텐진점", "11:00~22:00"],
        tag: "¥1000~1400",
        reviewCount: 3200,
      },
      {
        id: "fake-food-3",
        category: "food",
        name: "모츠나베 라쿠텐치",
        imageUrl: sampleFood,
        summary: ["나카스 도보 약 5분", "17:00~23:00"],
        tag: "¥2000~2500",
        reviewCount: 1800,
      },
    ],
    cafe: [
      {
        id: "fake-cafe-1",
        category: "cafe",
        name: "미누 커피 다이묘점",
        imageUrl: sampleDonut,
        summary: ["다이묘 도보 약 3분", "09:00~19:00"],
        tag: "¥600~900",
        reviewCount: 940,
      },
      {
        id: "fake-cafe-2",
        category: "cafe",
        name: "I'm donut? 후쿠오카 텐진점",
        imageUrl: sampleDonut,
        summary: ["텐진역 도보 약 4분"],
        tag: "¥220~240",
        reviewCount: 1806,
      },
    ],
    accommodation: [
      {
        id: "fake-accommodation-1",
        category: "accommodation",
        name: "JR 큐슈 호텔 블라썸 하카타 센트럴",
        imageUrl: sampleHotel,
        summary: ["하카타역 도보 약 2분"],
        tag: "공식 홈페이지 확인",
      },
      {
        id: "fake-accommodation-2",
        category: "accommodation",
        name: "니시테츠 호텔 크룸 하카타",
        imageUrl: sampleHotel,
        summary: ["하카타역 도보 약 5분"],
        tag: "공식 홈페이지 확인",
      },
    ],
    shopping: [
      {
        id: "fake-shopping-1",
        category: "shopping",
        name: "후쿠오카 PARCO",
        imageUrl: sampleHotel,
        summary: ["텐진역 직결", "10:00~20:00"],
        tag: "브랜드별 상이",
      },
      {
        id: "fake-shopping-2",
        category: "shopping",
        name: "캐널시티 하카타",
        imageUrl: sampleDonut,
        summary: ["나카스카와바타역 도보 약 5분", "10:00~21:00"],
        tag: "브랜드별 상이",
      },
    ],
    activity: [
      {
        id: "fake-activity-1",
        category: "activity",
        name: "나카스 리버 크루즈",
        imageUrl: sampleHotel,
        summary: ["나카스 선착장", "10:00~21:00"],
        tag: "¥1000~1200",
      },
    ],
    attraction: [
      {
        id: "fake-attraction-1",
        category: "attraction",
        name: "후쿠오카 타워",
        imageUrl: sampleHotel,
        summary: ["모모치 해변 도보 약 15분", "09:30~22:00"],
        tag: "¥800~1000",
      },
      {
        id: "fake-attraction-2",
        category: "attraction",
        name: "오호리 공원",
        imageUrl: sampleDonut,
        summary: ["오호리코엔역 도보 약 2분"],
        tag: "무료",
      },
    ],
  };
