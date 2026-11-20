import { useRef, type SyntheticEvent } from "react";
import { useBeforeUnload, useBlocker, useLocation, useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import linkBg from "@/shared/assets/images/link-bg.svg";
import plusIcon from "@/shared/assets/icons/plus-circle.svg";
import LinkInput from "@/features/source/ui/LinkInput";
import { useLinkForm } from "@/features/source/model/useLinkForm";
import {
  isAnalyzingState,
  isLinkAddState,
  type AnalyzingState,
} from "@/features/source/model/source.types";
import {
  LIME_BACKDROP,
  useScreenBackdrop,
} from "@/shared/hooks/useScreenBackdrop";
import styles from "./LinkAddPage.module.css";
import backIcon from "@/shared/assets/icons/back-arrow.svg";

export default function LinkAddPage() {
  useScreenBackdrop(LIME_BACKDROP);
  const location = useLocation();
  const initialLink = isLinkAddState(location.state)
    ? location.state.initialLink
    : "";
  const navigate = useNavigate();
  const fieldsRef = useRef<HTMLDivElement>(null);
  const { rows, filledLinks, canSubmit, changeRow, removeRow, addRow } =
    useLinkForm(initialLink);
  const hasEnteredLinks = filledLinks.length > 0;
  const leaveBlocker = useBlocker(
    ({ currentLocation, nextLocation, historyAction }) =>
      hasEnteredLinks &&
      currentLocation.pathname !== nextLocation.pathname &&
      !(
        historyAction === "PUSH" &&
        nextLocation.pathname === "/links/analyzing" &&
        isAnalyzingState(nextLocation.state)
      ),
  );
  const isLeaveDialogOpen = leaveBlocker.state === "blocked";

  useBeforeUnload((event) => {
    if (!hasEnteredLinks) return;
    event.preventDefault();
    event.returnValue = "";
  });

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
    <>
      <form className={styles.page} onSubmit={handleSubmit} inert={isLeaveDialogOpen}>
        <img className={styles.background} src={linkBg} alt="" />
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/home", { replace: true })}
          aria-label="뒤로 가기"
        >
          <img src={backIcon} alt="" />
        </button>
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
      <ConfirmModal
        isOpen={isLeaveDialogOpen}
        icon="alert"
        title="링크 불러오기를 그만할까요?"
        description="지금 나가면 입력한 링크가 저장되지 않을 수 있어요."
        cancelLabel="계속 입력"
        confirmLabel="나가기"
        onCancel={() => leaveBlocker.reset?.()}
        onConfirm={() => leaveBlocker.proceed?.()}
      />
    </>
  );
}
