import { useRef, useState } from "react";
import styles from "./CodeInput.module.css";

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
};

export default function CodeInput({
  value,
  onChange,
  length = 6,
  hasError = false,
}: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className={styles.wrapper} onClick={() => inputRef.current?.focus()}>
      <div className={styles.boxes} aria-hidden>
        {Array.from({ length }, (_, index) => (
          <span
            key={index}
            className={[
              styles.box,
              isFocused && index === activeIndex ? styles.active : "",
              hasError ? styles.error : "",
            ].join(" ")}
          >
            {value[index] ?? ""}
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        className={styles.input}
        value={value}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label="인증번호"
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, length))
        }
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
      />
    </div>
  );
}
