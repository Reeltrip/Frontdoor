import type { ReactNode } from "react";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import {
  LoadingArc,
  LoadingBlob,
  LoadingSpinner,
} from "@/shared/components/Loading";
import { MapMarker } from "@/shared/components/Map";
import PlaceCard from "@/features/place/ui/PlaceCard";
import PlaceCardCompact from "@/features/place/ui/PlaceCardCompact";
import CategoryChip from "@/features/place/ui/CategoryChip";
import type { Place } from "@/features/place/model/place.types";
import {
  CalendarDemo,
  CategoryFilterDemo,
  CategoryDialDemo,
  PlaceCarouselDemo,
  ChipDemo,
  ColorScale,
  DarkBox,
  LabeledInputDemo,
  LoadingSpeedDemo,
  ModalDemo,
  SegmentedButtonsDemo,
  TabBarDemo,
  TextFieldDemo,
} from "./DemoWidgets";
import sampleFood from "@/shared/assets/images/sample-food.png";
import sampleHotel from "@/shared/assets/images/sample-hotel.jpg";
import sampleDonut from "@/shared/assets/images/sample-donut.jpg";
import RecentCollectionCard from "@/features/source/ui/RecentCollectionCard";

export type ComponentDemo = {
  /** 컴포넌트 이름 */
  name: string;
  /** 파일 위치. 예: shared/components/Button */
  path: string;
  description?: string;
  /** 상태별로 하나씩. 예: 기본, 비활성, 로딩 */
  variants: { label: string; render: () => ReactNode }[];
};

// 가짜 데이터: 피그마 카드에 들어간 예시 그대로
const FOOD_PLACE: Place = {
  id: "demo-food",
  category: "food",
  name: "하카타 잇소 (博多一双)",
  imageUrl: sampleFood,
  summary: ["하카타역 동쪽 도보 약 6~7분", "11:00~24:00"],
  tag: "¥960~980",
  reviewCount: 6500,
};

const HOTEL_PLACE: Place = {
  id: "demo-hotel",
  category: "accommodation",
  name: "JR 큐슈 호텔 블라썸 하카타 센트럴",
  imageUrl: sampleHotel,
  summary: ["하카타역 도보 약 2분"],
  tag: "공식 홈페이지 확인",
};

const DONUT_PLACE: Place = {
  id: "demo-donut",
  category: "food",
  name: "I'm donut? 후쿠오카 텐진점",
  imageUrl: sampleDonut,
  summary: [],
  address: "후쿠오카시 주오구 와타나베도리 5-24-30, 1층",
  tag: "¥220~240",
  reviewCount: 1806,
};

const LIME_SCALE = [
  "10",
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const GRAY_SCALE = [
  "0",
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const TYPE_SCALE = [
  "display",
  "h1",
  "h2",
  "h3",
  "body1",
  "body2",
  "button",
  "caption",
];

const noop = () => {};

export const componentDemos: ComponentDemo[] = [
  {
    name: "DesignTokens",
    path: "app/styles/index.css",
    description: "피그마 디자인시스템의 색·글자 크기",
    variants: [
      {
        label: "라임",
        render: () => <ColorScale name="lime" steps={LIME_SCALE} />,
      },
      {
        label: "회색",
        render: () => <ColorScale name="gray" steps={GRAY_SCALE} />,
      },
      {
        label: "글자",
        render: () => (
          <div style={{ width: "100%" }}>
            {TYPE_SCALE.map((type) => (
              <p key={type} className={`text-${type}`} style={{ margin: 0 }}>
                {type} 후쿠오카 여행
              </p>
            ))}
          </div>
        ),
      },
    ],
  },
  {
    name: "TabBar",
    path: "shared/components/TabBar",
    description: "하단에 떠 있는 메뉴. 눌러서 선택 이동 확인",
    variants: [
      { label: "목록 선택", render: () => <TabBarDemo initialTab="menu" /> },
      { label: "계획 선택", render: () => <TabBarDemo initialTab="plan" /> },
      { label: "마이 선택", render: () => <TabBarDemo initialTab="profile" /> },
    ],
  },
  {
    name: "Button",
    path: "shared/components/Button",
    variants: [
      { label: "기본", render: () => <Button>다음</Button> },
      { label: "비활성", render: () => <Button disabled>다음</Button> },
      {
        label: "모달용 (md)",
        render: () => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 13,
              width: 310,
            }}
          >
            <Button variant="outline" size="md">
              직접 쓰기
            </Button>
            <Button size="md">불러오기</Button>
          </div>
        ),
      },
      {
        label: "어두운 화면 (glass) · 비활성",
        render: () => (
          <DarkBox>
            <Button variant="glass">생성하기</Button>
            <Button variant="glass" disabled>
              생성하기
            </Button>
          </DarkBox>
        ),
      },
    ],
  },
  {
    name: "SegmentedButtons",
    path: "shared/components/SegmentedButtons",
    description: "둘 중 하나 고르기. 눌러서 바꾸기 확인",
    variants: [{ label: "기본", render: () => <SegmentedButtonsDemo /> }],
  },
  {
    name: "LabeledInput",
    path: "shared/components/LabeledInput",
    description: "어두운 화면용 제목 + 입력칸. 눌러서 입력 중 모양 확인",
    variants: [
      { label: "비어 있음 · 입력함", render: () => <LabeledInputDemo /> },
    ],
  },
  {
    name: "Calendar",
    path: "shared/components/Calendar",
    description: "여행 기간 선택. 시작일 → 종료일 순서로 눌러 보기",
    variants: [{ label: "기간 선택", render: () => <CalendarDemo /> }],
  },
  {
    name: "TextField",
    path: "shared/components/TextField",
    variants: [
      { label: "비어 있음", render: () => <TextFieldDemo initialValue="" /> },
      {
        label: "입력함",
        render: () => <TextFieldDemo initialValue="후쿠오카" />,
      },
    ],
  },
  {
    name: "ConfirmModal",
    path: "shared/components/ConfirmModal",
    variants: [
      {
        label: "링크 불러오기",
        render: () => (
          <ConfirmModal
            isOpen
            isInline
            icon="link"
            title="링크가 있다면 자동으로 카드 채우기"
            description="내용을 직접 쓰지 않고도 내용을 쓸 수 있어요."
            cancelLabel="직접 쓰기"
            confirmLabel="불러오기"
            onCancel={noop}
            onConfirm={noop}
          />
        ),
      },
      {
        label: "변경사항 저장",
        render: () => (
          <ConfirmModal
            isOpen
            isInline
            icon="alert"
            title="변경사항이 감지되었어요."
            description="변경하신 내용을 저장할까요?"
            cancelLabel="그만두기"
            confirmLabel="저장하기"
            onCancel={noop}
            onConfirm={noop}
          />
        ),
      },
      {
        label: "여행 계획 완성 (어두운 모달)",
        render: () => (
          <ConfirmModal
            isOpen
            isInline
            theme="dark"
            icon="ticket"
            title="여행 계획이 만들어졌어요."
            description="어떻게 만들까요?"
            cancelLabel="AI 초안 만들기"
            confirmLabel="직접 만들기"
            onCancel={noop}
            onConfirm={noop}
          />
        ),
      },
      {
        label: "숙소 위치 묻기",
        render: () => (
          <ConfirmModal
            isOpen
            isInline
            icon="alert"
            title="숙소 위치가 어디인가요?"
            description="선택한 주소가 메일의 출발지, 도착지가 돼요."
            cancelLabel="건너뛰기"
            confirmLabel="추가하기"
            onCancel={noop}
            onConfirm={noop}
          />
        ),
      },
      { label: "화면 위에 띄우기", render: () => <ModalDemo /> },
    ],
  },
  {
    name: "PlaceCard",
    path: "features/place/ui/PlaceCard",
    description: "사진 위 큰 요약 카드",
    variants: [
      { label: "기본", render: () => <PlaceCard place={FOOD_PLACE} /> },
      {
        label: "이름이 길 때 (말줄임)",
        render: () => <PlaceCard place={HOTEL_PLACE} />,
      },
    ],
  },
  {
    name: "PlaceCardCompact",
    path: "features/place/ui/PlaceCardCompact",
    description: "흰 바탕 작은 요약 카드",
    variants: [
      { label: "기본", render: () => <PlaceCardCompact place={DONUT_PLACE} /> },
    ],
  },
  {
    name: "CategoryChip",
    path: "features/place/ui/CategoryChip",
    variants: [
      {
        label: "선택 안 함",
        render: () => <CategoryChip category="food" isSelected={false} />,
      },
      {
        label: "선택함",
        render: () => <CategoryChip category="food" isSelected />,
      },
      { label: "눌러서 바꾸기", render: () => <ChipDemo /> },
      {
        label: "전체 필터 (눌러서 바꾸기)",
        render: () => <CategoryFilterDemo />,
      },
      {
        label: "아이콘 없는 카테고리 (교통)",
        render: () => (
          <CategoryChip category="transportation" isSelected={false} />
        ),
      },
    ],
  },

  {
    name: "PlaceCarousel",
    path: "features/place/ui/PlaceCarousel",
    description:
      "요약카드를 좌우로 끌어서 넘겨 보는 목록. 양옆 카드는 기울어져 보임",
    variants: [
      { label: "기본 (카드 3장)", render: () => <PlaceCarouselDemo /> },
    ],
  },
  {
    name: "CategoryDial",
    path: "features/place/ui/CategoryDial",
    description: "좌우로 끌어서 돌리는 카테고리 다이얼. 눈금이 같이 돌아감",
    variants: [{ label: "기본", render: () => <CategoryDialDemo /> }],
  },
  {
    name: "RecentCollectionCard",
    path: "features/source/ui/RecentCollectionCard",
    description: "홈의 최근 수집 내역 한 줄",
    variants: [
      {
        label: "기본",
        render: () => (
          <RecentCollectionCard
            collection={{
              id: "demo",
              date: "2026.10.29",
              title: "오사카 여행 플랜",
            }}
          />
        ),
      },
    ],
  },
  {
    name: "MapMarker",
    path: "shared/components/Map/MapMarker",
    description: "지도 위 장소 노드",
    variants: [
      {
        label: "기본 · 선택 · 다른 일자",
        render: () => (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 32,
              padding: 12,
            }}
          >
            <MapMarker imageUrl={sampleDonut} name="I'm donut?" />
            <MapMarker imageUrl={sampleDonut} name="I'm donut?" size="lg" />
            <MapMarker imageUrl={sampleDonut} name="I'm donut?" isMuted />
          </div>
        ),
      },
    ],
  },
  {
    name: "Loading",
    path: "shared/components/Loading",
    description: "speed prop으로 회전 속도 배율 조절 (기본 1)",
    variants: [
      { label: "속도 조절", render: () => <LoadingSpeedDemo /> },
      { label: "작은 스피너", render: () => <LoadingSpinner /> },
      { label: "회색 호", render: () => <LoadingArc /> },
      { label: "분석 중 (큰 로딩)", render: () => <LoadingBlob /> },
    ],
  },
];
