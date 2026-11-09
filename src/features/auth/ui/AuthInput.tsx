import styles from "./AuthInput.module.css";

type AuthInputProps = {
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  errorMessage?: string;
};

// 공통 입력칸이 올라오면 shared 컴포넌트로 교체
export default function AuthInput({
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  errorMessage = "",
}: AuthInputProps) {
  const hasError = errorMessage !== "";

  return (
    <div>
      <input
        className={`${styles.input} ${hasError ? styles.error : ""}`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={hasError}
      />
      {hasError && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
}
