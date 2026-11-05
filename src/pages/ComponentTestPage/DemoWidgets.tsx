// demos.tsx에서 쓰는 상태가 있는 데모 조각들
import { useState } from 'react';
import Button from '@/shared/components/Button';
import TextField from '@/shared/components/TextField';
import TabBar, { type TabKey } from '@/shared/components/TabBar';
import ConfirmModal from '@/shared/components/ConfirmModal';
import CategoryChip from '@/features/place/ui/CategoryChip';
import { LoadingBlob, LoadingSpinner } from '@/shared/components/Loading';

export function ColorScale({ name, steps }: { name: string; steps: string[] }) {
  return (
    <div style={{ width: '100%' }}>
      {steps.map((step) => (
        <div
          key={step}
          className="text-caption"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: `var(--color-${name}-${step})`,
            color: Number(step) >= 600 ? 'var(--color-white)' : 'var(--color-gray-900)',
          }}
        >
          <span>{step}</span>
          <span>--color-{name}-{step}</span>
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
  return <TextField value={value} onChange={setValue} placeholder="장소를 입력해주세요." />;
}

export function ChipDemo() {
  const [isSelected, setIsSelected] = useState(false);
  return <CategoryChip category="food" isSelected={isSelected} onClick={() => setIsSelected(!isSelected)} />;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <label className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ whiteSpace: 'nowrap' }}>속도</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.05}
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-lime-500)' }}
        />
        <span style={{ minWidth: 44, textAlign: 'right' }}>{speed.toFixed(2)}배</span>
        <button type="button" className="text-caption" onClick={() => setSpeed(1)}>
          초기화
        </button>
      </label>
      <p className="text-caption" style={{ margin: 0, color: 'var(--color-gray-500)' }}>
        한 바퀴: 스피너 {(1.2 / speed).toFixed(2)}초 · 큰 로딩 바깥 {(2.4 / speed).toFixed(2)}초 / 안쪽{' '}
        {(1.6 / speed).toFixed(2)}초
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 24, flexWrap: 'wrap' }}>
        <LoadingSpinner speed={speed} />
        <LoadingBlob speed={speed} />
      </div>
    </div>
  );
}
