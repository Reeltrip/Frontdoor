import clearIcon from "@/shared/assets/icons/input-clear.svg";
import styles from "./LinkInput.module.css";

type LinkInputProps = {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder?: string;
};

export default function LinkInput({
  value,
  onChange,
  onRemove,
  placeholder = "https://youtube.com/shorts/[영상 ID]",
}: LinkInputProps) {
  return (
    <div className={styles.field}>
      <input
        className={styles.input}
        type="url"
        inputMode="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      <button
        type="button"
        className={styles.clear}
        onClick={onRemove}
        aria-label="링크 입력칸 삭제"
      >
        <img src={clearIcon} alt="" />
      </button>
    </div>
  );
}
