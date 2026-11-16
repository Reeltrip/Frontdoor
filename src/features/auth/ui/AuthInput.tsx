import styles from "./AuthInput.module.css";

type AuthInputProps = {
  variant?: "box" | "underline";
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  errorMessage?: string;
  maxLength?: number;
  autoFocus?: boolean;
};

export default function AuthInput({
  variant = "box",
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  errorMessage = "",
  maxLength,
  autoFocus,
}: AuthInputProps) {
  const hasError = errorMessage !== "";

  return (
    <div>
      <input
        className={`${styles.input} ${variant === "underline" ? styles.underline : ""} ${hasError ? styles.error : ""}`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        autoFocus={autoFocus}
        aria-invalid={hasError}
      />
      {hasError && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
}
