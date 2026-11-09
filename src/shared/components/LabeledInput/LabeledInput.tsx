import { useId, type InputHTMLAttributes } from 'react';
import styles from './LabeledInput.module.css';

type LabeledInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  label: string;
  value: string;
  onChange?: (value: string) => void;
};

// 어두운 화면용 제목 + 입력칸 (여행계획 생성의 여행 이름·여행 기간)
export default function LabeledInput({ label, value, onChange, className, ...rest }: LabeledInputProps) {
  const inputId = useId();

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={styles.input}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        {...rest}
      />
    </div>
  );
}
