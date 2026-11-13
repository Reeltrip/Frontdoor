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
  FAKE_RESULT_CATEGORIES,
  FAKE_RESULT_INITIAL_INDEX,
} from "@/features/place/api/fakeResult";
import CategoryDial from "@/features/place/ui/CategoryDial";
import PlaceCarousel from "@/features/place/ui/PlaceCarousel";
import { FAKE_PLACES_BY_CATEGORY } from "@/features/place/api/fakePlaces";

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

export function TabBarDemo({ initialTab }: { initialTab: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  return <TabBar activeTab={activeTab} onChange={setActiveTab} />;
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
  const places = FAKE_PLACES_BY_CATEGORY.food ?? [];
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

export function CategoryDialDemo() {
  const [activeIndex, setActiveIndex] = useState(FAKE_RESULT_INITIAL_INDEX);
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
        items={FAKE_RESULT_CATEGORIES}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </div>
  );
}

export function CategoryWheelDemo() {
  const [activeIndex, setActiveIndex] = useState(FAKE_RESULT_INITIAL_INDEX);
  return (
    <div style={{ height: 640 }}>
      <CategoryWheel
        items={FAKE_RESULT_CATEGORIES}
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
export function CalendarDemo() {
  const [range, setRange] = useState<Date[]>([new Date(2026, 10, 20)]);
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
