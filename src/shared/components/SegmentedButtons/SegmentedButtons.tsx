import Button from '@/shared/components/Button';
import styles from './SegmentedButtons.module.css';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedButtonsProps<T extends string> = {
  options: [SegmentedOption<T>, SegmentedOption<T>];
  value: T;
  onChange: (value: T) => void;
  label?: string;
};

// 두 개 중 하나를 고르는 버튼. 고른 쪽이 검은 배경 (피그마 Button 3: 그만두기 / 읽기 전용)
export default function SegmentedButtons<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedButtonsProps<T>) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Button
            key={option.value}
            variant={isSelected ? 'filled' : 'outline'}
            size="sm"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
