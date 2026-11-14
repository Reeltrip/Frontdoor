import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import kebabIcon from "@/shared/assets/icons/kebab.svg";
import plusIcon from "@/shared/assets/icons/plus.svg";
import trashOutlineIcon from "@/shared/assets/icons/trash-outline.svg";
import Button from "@/shared/components/Button";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { LoadingSpinner } from "@/shared/components/Loading";
import {
  DEFAULT_MAP_CENTER,
  MapView,
  type MapPosition,
} from "@/shared/components/Map";
import TabBar, { type TabKey } from "@/shared/components/TabBar";
import { toMapNodes } from "@/features/place/lib/mapNodes";
import { useDeletePlace, usePlaces } from "@/features/place/model/usePlaces";
import type { Place, PlaceCategory } from "@/features/place/model/place.types";
import CategoryFilterBar from "@/features/place/ui/CategoryFilterBar";
import PlaceCardStrip from "@/features/place/ui/PlaceCardStrip";
import styles from "./LibraryPage.module.css";

export default function LibraryPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [center, setCenter] = useState<MapPosition>(DEFAULT_MAP_CENTER);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { places, viewStatus, refetch } = usePlaces(
    category === "all" ? {} : { category },
  );
  const deletePlace = useDeletePlace();

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

  const nodes = toMapNodes(places);
  const mappedPlaces = places.filter((place) =>
    nodes.some((node) => node.id === place.id),
  );
  const selectedPlace = mappedPlaces.find((place) => place.id === selectedId);

  const selectPlace = (placeId: string) => {
    const place = mappedPlaces.find((item) => item.id === placeId);
    setSelectedId(placeId);
    if (place?.location) setCenter(place.location);
  };

  const changeCategory = (next: PlaceCategory | "all") => {
    setCategory(next);
    setSelectedId(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    deletePlace.reset();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deletePlace.mutate(deleteTarget.id, {
      onSuccess: () => {
        setSelectedId(null);
        closeDeleteModal();
      },
    });
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab === "menu") navigate("/home");
  };

  const hasSelection = Boolean(selectedPlace);

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>카테고리 보관함</h1>
          <div ref={menuRef} className={styles.menuWrap}>
            <button
              type="button"
              className={styles.menuButton}
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
                  className={styles.menuItem}
                  onClick={() => navigate("/library/trash")}
                >
                  <img src={trashOutlineIcon} alt="" />
                  휴지통 보기
                </button>
              </div>
            )}
          </div>
        </div>
        <CategoryFilterBar selected={category} onChange={changeCategory} />
      </div>

      <div className={styles.mapArea}>
        <MapView
          className={styles.map}
          center={center}
          nodes={nodes}
          selectedNodeId={selectedId}
          onSelectNode={selectPlace}
          onClickMap={() => {
            setSelectedId(null);
            setIsMenuOpen(false);
          }}
        />

        {viewStatus === "loading" && (
          <div className={styles.status}>
            <LoadingSpinner label="보관함을 불러오는 중" />
            <p className={styles.statusText}>카드를 불러오는 중이에요.</p>
          </div>
        )}
        {viewStatus === "error" && (
          <div className={styles.status} role="alert">
            <p className={styles.statusTitle}>카드를 불러오지 못했어요.</p>
            <p className={styles.statusText}>
              네트워크 연결을 확인하고 다시 시도해 주세요.
            </p>
            <Button
              variant="outline"
              size="sm"
              isFullWidth={false}
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
          </div>
        )}
        {viewStatus === "empty" && (
          <div className={styles.status}>
            <p className={styles.statusTitle}>보관한 카드가 없어요.</p>
            <p className={styles.statusText}>링크를 추가하면 여기에 모여요.</p>
          </div>
        )}
        {viewStatus === "success" && nodes.length === 0 && (
          <p className={styles.notice}>
            이 카테고리의 카드는 지도에 표시되지 않아요.
          </p>
        )}
      </div>

      <div className={styles.bottom}>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => navigate("/home")}
          aria-label="카드 추가"
        >
          <img src={plusIcon} alt="" />
        </button>

        {hasSelection && (
          <div className={styles.strip}>
            <PlaceCardStrip
              places={mappedPlaces}
              selectedId={selectedId}
              onSelect={selectPlace}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
        <TabBar
          activeTab="archive"
          onChange={handleTabChange}
          className={styles.tabBar}
        />
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        icon="alert"
        title="카드를 삭제할까요?"
        description={
          deletePlace.isError
            ? "삭제하지 못했어요. 다시 시도해 주세요."
            : "삭제하면 보관함에서 사라져요."
        }
        cancelLabel="아니요"
        confirmLabel={deletePlace.isPending ? "삭제 중" : "삭제하기"}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        isDismissible={false}
      />
    </main>
  );
}
