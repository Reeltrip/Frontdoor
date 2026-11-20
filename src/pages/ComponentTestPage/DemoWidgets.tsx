// demos.tsx에서 쓰는 상태가 있는 데모 조각들
import { useState, type ReactNode } from "react";
import Button from "@/shared/components/Button";
import TextField from "@/shared/components/TextField";
import TabBar, { type TabKey } from "@/shared/components/TabBar";
import ConfirmModal from "@/shared/components/ConfirmModal";
import CategoryWheel from "@/features/place/ui/CategoryWheel";
import CategoryChip from "@/features/place/ui/CategoryChip";
import {
  LoadingArc,
  LoadingBlob,
  LoadingSpinner,
} from "@/shared/components/Loading";
import LabeledInput from "@/shared/components/LabeledInput";
import Calendar from "@/shared/components/Calendar";
import SegmentedButtons from "@/shared/components/SegmentedButtons";
import { FILTER_CATEGORY_KEYS } from "@/features/place/lib/categories";
import type { PlaceCategory } from "@/features/place/model/place.types";
import {
  DEMO_PLACES,
  DEMO_RESULT_CATEGORIES,
  DEMO_RESULT_INITIAL_INDEX,
} from "./demoData";
import CategoryDial from "@/features/place/ui/CategoryDial";
import PlaceCarousel from "@/features/place/ui/PlaceCarousel";
import Toast from "@/shared/components/Toast";
import PlaceEditCard from "@/features/place/ui/PlaceEditCard";
import { toDraft, type PlaceDraft } from "@/features/place/model/placeEdit";
import {
  PlanTutorialHint,
  PlanTutorialOverlay,
  PlanTutorialCardFocus,
} from "@/features/plan/ui/PlanTutorial";
import type { PlanTutorialKind } from "@/features/plan/lib/planTutorialSeen";
export function ColorScale({ name, steps }: { name: string; steps: string[] }) {
  return (
    <div style={{ width: "100%" }}>
      {steps.map((step) => (
        <div
          key={step}
          className="text-caption"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 12px",
            background: `var(--color-${name}-${step})`,
            color:
              Number(step) >= 600
                ? "var(--color-white)"
                : "var(--color-gray-900)",
          }}
        >
          <span>{step}</span>
          <span>
            --color-{name}-{step}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TabBarDemo({
  initialTab,
  theme = "light",
}: {
  initialTab: TabKey;
  theme?: "light" | "dark";
}) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const bar = (
    <TabBar activeTab={activeTab} onChange={setActiveTab} theme={theme} />
  );
  if (theme === "light") return bar;
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "var(--color-gray-900)",
      }}
    >
      {bar}
    </div>
  );
}

export function TextFieldDemo({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <TextField
      value={value}
      onChange={setValue}
      placeholder="장소를 입력해주세요."
    />
  );
}
export function PlaceCarouselDemo() {
  const [activeIndex, setActiveIndex] = useState(1);
  const places = DEMO_PLACES;
  return (
    <div style={{ width: 390, height: 360, overflow: "hidden" }}>
      <PlaceCarousel
        places={places}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </div>
  );
}

/** edit에 넣은 칸만 바꿔서 시작해요. 빈 문자열이면 그 칸을 고치는 중인 모양이에요 */
export function PlaceEditCardDemo({
  edit = {},
}: {
  edit?: Partial<PlaceDraft>;
}) {
  const place = DEMO_PLACES[0];
  const [draft, setDraft] = useState<PlaceDraft>(() => ({
    ...toDraft(place),
    ...edit,
  }));
  return <PlaceEditCard place={place} draft={draft} onDraftChange={setDraft} />;
}

export function ToastDemo({
  message = "편집하신 내용이 저장되었습니다.",
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 390,
        height: 180,
        overflow: "hidden",
      }}
    >
      <Toast message={message} />
    </div>
  );
}

export function CategoryDialDemo({ variant }: { variant?: "summary" }) {
  const [activeIndex, setActiveIndex] = useState(DEMO_RESULT_INITIAL_INDEX);
  return (
    <div
      style={{
        position: "relative",
        width: 390,
        height: 319,
        overflow: "hidden",
      }}
    >
      <CategoryDial
        items={DEMO_RESULT_CATEGORIES}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        variant={variant}
      />
    </div>
  );
}

export function CategoryWheelDemo({
  photoState = "missing",
}: {
  photoState?: "missing" | "loaded" | "error";
}) {
  const [activeIndex, setActiveIndex] = useState(DEMO_RESULT_INITIAL_INDEX);
  const items = DEMO_RESULT_CATEGORIES.map((item) => ({
    ...item,
    imageUrl:
      photoState === "loaded"
        ? DEMO_PLACES[0].imageUrl
        : photoState === "error"
          ? "/missing-wheel-photo.png"
          : undefined,
  }));
  return (
    <div style={{ width: 390, maxWidth: "100%", height: 640 }}>
      <CategoryWheel
        items={items}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        onView={() => {}}
      />
    </div>
  );
}

export function ChipDemo() {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <CategoryChip
      category="food"
      isSelected={isSelected}
      onClick={() => setIsSelected(!isSelected)}
    />
  );
}

export function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button size="md" isFullWidth={false} onClick={() => setIsOpen(true)}>
        모달 열기
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        icon="alert"
        title="변경사항이 감지되었어요."
        description="변경하신 내용을 저장할까요?"
        cancelLabel="그만두기"
        confirmLabel="저장하기"
        onCancel={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  );
}

// 위쪽 바로 로딩 회전 속도를 바꿔 보는 데모. 마음에 드는 배율을 speed prop에 넣으면 됨
export function LoadingSpeedDemo() {
  const [speed, setSpeed] = useState(1);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
      }}
    >
      <label
        className="text-caption"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <span style={{ whiteSpace: "nowrap" }}>속도</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          style={{ flex: 1, accentColor: "var(--color-lime-500)" }}
        />
        <span style={{ minWidth: 44, textAlign: "right" }}>
          {speed.toFixed(2)}배
        </span>
        <button
          type="button"
          className="text-caption"
          onClick={() => setSpeed(1)}
        >
          초기화
        </button>
      </label>
      <p
        className="text-caption"
        style={{ margin: 0, color: "var(--color-gray-500)" }}
      >
        한 바퀴: 스피너·회색 호 {(1.2 / speed).toFixed(2)}초 · 큰 로딩 바깥{" "}
        {(2.4 / speed).toFixed(2)}초 / 안쪽 {(1.6 / speed).toFixed(2)}초
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <LoadingSpinner speed={speed} />
        <LoadingArc speed={speed} />
        <LoadingBlob speed={speed} />
      </div>
    </div>
  );
}

// 어두운 화면에 놓이는 컴포넌트를 보여줄 때 쓰는 배경
export function DarkBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
        padding: 20,
        borderRadius: 12,
        background: "var(--color-gray-900)",
      }}
    >
      {children}
    </div>
  );
}

export function CategoryFilterDemo() {
  const [selected, setSelected] = useState<PlaceCategory | "all">("cafe");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {(["all", ...FILTER_CATEGORY_KEYS] as const).map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selected === category}
          onClick={() => setSelected(category)}
        />
      ))}
    </div>
  );
}

export function LabeledInputDemo() {
  const [name, setName] = useState("");
  const [filledName, setFilledName] = useState("후쿠오카 3박 4일");
  return (
    <DarkBox>
      <LabeledInput
        label="여행 이름"
        value={name}
        onChange={setName}
        placeholder="이름을 입력해주세요."
      />
      <LabeledInput
        label="여행 이름"
        value={filledName}
        onChange={setFilledName}
        placeholder="이름을 입력해주세요."
      />
    </DarkBox>
  );
}

const formatDate = (date: Date) => `${date.getMonth() + 1}.${date.getDate()}`;

// 첫 클릭은 시작일, 두 번째는 종료일, 세 번째는 다시 시작일
export function CalendarDemo({ endDay }: { endDay?: number }) {
  const [range, setRange] = useState<Date[]>(
    endDay
      ? [new Date(2026, 10, 19), new Date(2026, 10, endDay)]
      : [new Date(2026, 10, 19)],
  );
  const handleSelect = (date: Date) => {
    if (range.length !== 1 || date < range[0]) {
      setRange([date]);
      return;
    }
    setRange([range[0], date]);
  };
  return (
    <DarkBox>
      <LabeledInput
        label="여행 기간"
        value={range.map(formatDate).join(" ~ ")}
        placeholder="날짜를 선택해주세요."
        readOnly
      />
      <Calendar selectedDates={range} onSelectDate={handleSelect} />
    </DarkBox>
  );
}

export function SegmentedButtonsDemo() {
  const [mode, setMode] = useState<"stop" | "readOnly">("readOnly");
  return (
    <SegmentedButtons
      label="편집 방식"
      options={[
        { value: "stop", label: "그만두기" },
        { value: "readOnly", label: "읽기 전용" },
      ]}
      value={mode}
      onChange={setMode}
    />
  );
}
/**
 * 여행계획 튜토리얼 모양 확인용 (피그마 S4-5c-2, S4-5c).
 * 배경은 지도가 아니라 회색 가짜 배경이에요. 막을 눌러 닫고, 닫은 뒤 "다시 보기"로 열 수 있어요.
 */
export function PlanTutorialDemo({
  kind,
  card,
}: {
  kind: PlanTutorialKind;
  card?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: 390,
        height: 640,
        overflow: "hidden",
        background: "#d6d9d1",
      }}
    >
      {isOpen && (
        <PlanTutorialOverlay kind={kind} onClose={() => setIsOpen(false)} />
      )}

      {/* 막(z-index 5) 위로 아래쪽 버튼·카드가 보이게 올려요 */}
      <div style={{ position: "relative", zIndex: isOpen ? 6 : 0 }}>
        {kind === "confirm" ? (
          // 실제 화면의 .actions처럼 세로로 쌓고 간격 8px
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingBottom: 44,
            }}
          >
            {isOpen && <PlanTutorialHint kind="confirm" />}
            <div style={{ padding: "0 20px" }}>
              <Button
                style={
                  isOpen
                    ? { boxShadow: "0 0 25px rgba(255, 255, 255, 0.67)" }
                    : undefined
                }
              >
                이 장소로 확정
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isOpen && <PlanTutorialHint kind="planB" />}
            <div style={{ paddingBottom: 30 }}>
              <PlanTutorialCardFocus active={isOpen}>
                {card}
              </PlanTutorialCardFocus>
            </div>
          </>
        )}
      </div>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "6px 12px",
          }}
        >
          튜토리얼 다시 보기
        </button>
      )}
    </div>
  );
}
