import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import backIcon from "@/shared/assets/icons/back-arrow.svg";
import closeIcon from "@/shared/assets/icons/close.svg";
import kebabIcon from "@/shared/assets/icons/kebab.svg";
import restoreIcon from "@/shared/assets/icons/restore.svg";
import trashRedIcon from "@/shared/assets/icons/trash-outline-red.svg";
import { FAKE_TRASH_PLACES } from "@/features/place/api/fakeTrashPlaces";
import TrashPlaceRow from "@/features/place/ui/TrashPlaceRow";
import styles from "./LibraryTrashPage.module.css";

export default function LibraryTrashPage() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState(FAKE_TRASH_PLACES);
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

  const hasSelection = selectedIds.length > 0;

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

  const removeSelected = () => {
    setPlaces((items) =>
      items.filter((place) => !selectedIds.includes(place.id)),
    );
    finishSelecting();
  };

  const handleDelete = () => {
    if (hasSelection) removeSelected();
  };

  const handleRestore = () => {
    if (hasSelection) removeSelected();
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

      {places.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>휴지통이 비어 있어요.</p>
          <p className={styles.emptyDescription}>
            삭제한 카드가 여기에 보여요.
          </p>
        </div>
      ) : (
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
      )}
    </main>
  );
}
