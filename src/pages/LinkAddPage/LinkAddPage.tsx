import { useRef, type SyntheticEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import linkBg from "@/shared/assets/images/link-bg.svg";
import plusIcon from "@/shared/assets/icons/plus-circle.svg";
import LinkInput from "@/features/source/ui/LinkInput";
import { useLinkForm } from "@/features/source/model/useLinkForm";
import {
  isLinkAddState,
  type AnalyzingState,
} from "@/features/source/model/source.types";
import styles from "./LinkAddPage.module.css";

export default function LinkAddPage() {
  const location = useLocation();
  const initialLink = isLinkAddState(location.state)
    ? location.state.initialLink
    : "";
  const navigate = useNavigate();
  const fieldsRef = useRef<HTMLDivElement>(null);
  const { rows, filledLinks, canSubmit, changeRow, removeRow, addRow } =
    useLinkForm(initialLink);

  const handleAddRow = () => {
    addRow();

    requestAnimationFrame(() => {
      const inputs = fieldsRef.current?.querySelectorAll("input");
      const lastInput = inputs?.[inputs.length - 1];
      lastInput?.focus({ preventScroll: true });
      lastInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const state: AnalyzingState = { links: filledLinks };
    navigate("/links/analyzing", { state });
  };

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <img className={styles.background} src={linkBg} alt="" />

      <header className={styles.header}>
        <h1 className={styles.title}>
          모아둔 여행 영상 링크를
          <br />
          보여주세요!
        </h1>
        <p className={styles.description}>
          유튜브, 인스타그램 릴스, 블로그 모두 좋아요!
        </p>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddRow}
        >
          링크 추가하기
          <img src={plusIcon} alt="" className={styles.addIcon} />
        </button>
      </header>

      <div className={styles.fields} ref={fieldsRef}>
        {rows.map((row) => (
          <LinkInput
            key={row.id}
            value={row.value}
            onChange={(value) => changeRow(row.id, value)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={!canSubmit}>
          요약카드 만들기
        </Button>
      </div>

      {/* 입력 중에는 입력 중인 칸만 남기고 화면을 어둡게 함 */}
      <div className={styles.dim} aria-hidden />
    </form>
  );
}
