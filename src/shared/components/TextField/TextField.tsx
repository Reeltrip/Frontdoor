import type { InputHTMLAttributes } from 'react';
import styles from './TextField.module.css';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

// 아래에 (글자 수/최대) 표시가 붙는 한 줄 입력칸
export default function TextField({
  value,
  onChange,
  maxLength = 50,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <input
        className={styles.input}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
      <p className={styles.counter} aria-live="polite">
        ({value.length}/{maxLength})
      </p>
    </div>
  );
}
