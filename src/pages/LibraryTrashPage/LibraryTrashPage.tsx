import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import closeIcon from "@/shared/assets/icons/close.svg";
import kebabIcon from "@/shared/assets/icons/kebab.svg";
import restoreIcon from "@/shared/assets/icons/restore.svg";
import trashRedIcon from "@/shared/assets/icons/trash-outline-red.svg";
import { getErrorMessage } from "@/shared/api/client";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { LoadingSpinner } from "@/shared/components/Loading";
import Toast from "@/shared/components/Toast";
import { useScreenBackdrop } from "@/shared/hooks/useScreenBackdrop";
import {
  useDeletedPlaces,
  usePurgePlaces,
  useRestorePlaces,
} from "@/features/place/model/usePlaces";
import TrashPlaceRow from "@/features/place/ui/TrashPlaceRow";
import styles from "./LibraryTrashPage.module.css";

const TOAST_DURATION_MS = 2000;

export default function LibraryTrashPage() {
  const navigate = useNavigate();
  // 화면 위쪽 색(#fafafa)을 상태바와 맨 위 띠에도 맞춰요
  useScreenBackdrop("#fafafa");
  const { places, viewStatus, error, refetch } = useDeletedPlaces();
  const restorePlaces = useRestorePlaces();
  const purgePlaces = usePurgePlaces();
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node))
        setIsMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(
      () => setToastMessage(null),
      TOAST_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const isWorking = restorePlaces.isPending || purgePlaces.isPending;
  const hasSelection = selectedIds.length > 0 && !isWorking;

  const finishSelecting = () => {
    setIsSelecting(false);
    setSelectedIds([]);
    setIsMenuOpen(false);
  };

  const toggleSelected = (placeId: string) => {
    setSelectedIds((ids) =>
      ids.includes(placeId)
        ? ids.filter((id) => id !== placeId)
        : [...ids, placeId],
    );
  };

  // 되돌릴 수 없어서 한 번 더 물어봐요
  const handleDelete = () => {
    if (!hasSelection) return;
    setIsMenuOpen(false);
    setIsPurgeConfirmOpen(true);
  };

  const confirmPurge = () => {
    const count = selectedIds.length;
    setIsPurgeConfirmOpen(false);
    setToastMessage("삭제하는 중이에요.");
    purgePlaces.mutate(selectedIds, {
      onSuccess: () => {
        finishSelecting();
        setToastMessage(`카드 ${count}개를 완전히 삭제했어요.`);
      },
      onError: () => setToastMessage("삭제하지 못했어요. 다시 시도해 주세요."),
    });
  };

  const handleRestore = () => {
    if (!hasSelection) return;
    const count = selectedIds.length;
    setIsMenuOpen(false);
    setToastMessage("보관함으로 옮기는 중이에요.");
    restorePlaces.mutate(selectedIds, {
      onSuccess: () => {
        finishSelecting();
        setToastMessage(`카드 ${count}개를 보관함으로 옮겼어요.`);
      },
      onError: () => setToastMessage("복구하지 못했어요. 다시 시도해 주세요."),
    });
  };

  const renderBody = () => {
    if (viewStatus === "loading") {
      return (
        <div className={styles.empty}>
          <LoadingSpinner label="휴지통을 불러오는 중" />
        </div>
      );
    }
    if (viewStatus === "error") {
      return (
        <div className={styles.empty} role="alert">
          <p className={styles.emptyTitle}>휴지통을 불러오지 못했어요.</p>
          <p className={styles.emptyDescription}>{getErrorMessage(error)}</p>
          <Button size="sm" isFullWidth={false} onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      );
    }
    if (viewStatus === "empty") {
      return (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>휴지통이 비어 있어요.</p>
          <p className={styles.emptyDescription}>
            삭제한 카드가 여기에 보여요.
          </p>
        </div>
      );
    }
    return (
      <>
        <p className={styles.count}>총 {places.length}개의 카드</p>
        <div className={styles.listArea}>
          <ul className={styles.list}>
            {places.map((place) => (
              <TrashPlaceRow
                key={place.id}
                place={place}
                isSelectable={isSelecting}
                isSelected={selectedIds.includes(place.id)}
                onToggle={() => toggleSelected(place.id)}
              />
            ))}
          </ul>
        </div>
      </>
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className={styles.title}>휴지통 보기</h1>

        <div className={styles.actions}>
          {isSelecting ? (
            <>
              <div ref={menuRef} className={styles.menuWrap}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="더보기"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                >
                  <img src={kebabIcon} alt="" />
                </button>
                {isMenuOpen && (
                  <div className={styles.menu} role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className={`${styles.menuItem} ${styles.danger}`}
                      disabled={!hasSelection}
                      onClick={handleDelete}
                    >
                      <img src={trashRedIcon} alt="" />
                      삭제
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.menuItem}
                      disabled={!hasSelection}
                      onClick={handleRestore}
                    >
                      <img src={restoreIcon} alt="" />
                      복구
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={finishSelecting}
                aria-label="선택 끝내기"
              >
                <img src={closeIcon} alt="" />
              </button>
            </>
          ) : (
            places.length > 0 && (
              <button
                type="button"
                className={styles.selectButton}
                onClick={() => setIsSelecting(true)}
              >
                선택
              </button>
            )
          )}
        </div>
      </header>

      {renderBody()}

      <ConfirmModal
        isOpen={isPurgeConfirmOpen}
        icon="alert"
        title={`카드 ${selectedIds.length}개를 완전히 삭제할까요?`}
        description="삭제하면 되돌릴 수 없어요."
        cancelLabel="취소"
        confirmLabel="삭제"
        onCancel={() => setIsPurgeConfirmOpen(false)}
        onConfirm={confirmPurge}
      />
      {toastMessage && <Toast message={toastMessage} />}
    </main>
  );
}
