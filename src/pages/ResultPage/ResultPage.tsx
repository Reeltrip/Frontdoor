import { useState } from "react";
import { useNavigate } from "react-router";
import { getErrorMessage } from "@/shared/api/client";
import Button from "@/shared/components/Button";
import Header from "@/shared/components/Header";
import { LoadingSpinner } from "@/shared/components/Loading";
import CategoryWheel from "@/features/place/ui/CategoryWheel";
import { useResultPlaces } from "@/features/place/model/useResultPlaces";
import styles from "./ResultPage.module.css";
import type { ResultCategoryItem } from "@/features/place/model/result.types";

export default function ResultPage() {
  const navigate = useNavigate();
  const { title, items, initialIndex, viewStatus, error, refetch } =
    useResultPlaces();
  // null이면 카드가 가장 많은 카테고리 (목록을 받은 뒤에야 알 수 있어서)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const activeIndex = pickedIndex ?? initialIndex;

  const handleView = (item?: ResultCategoryItem) => {
    const categoryIndex = item ? items.indexOf(item) : activeIndex;
    navigate("/cards", { state: { categoryIndex } });
  };

  if (viewStatus === "loading") {
    return (
      <main className={styles.page}>
        <Header title="요약카드" onBack={() => navigate(-1)} />
        <div className={styles.wheelArea}>
          <LoadingSpinner label="요약카드를 불러오는 중" />
        </div>
      </main>
    );
  }

  if (viewStatus === "error") {
    return (
      <main className={styles.page} role="alert">
        <Header title="요약카드" onBack={() => navigate(-1)} />
        <div className={styles.wheelArea}>
          <p>요약카드를 불러오지 못했어요. {getErrorMessage(error)}</p>
        </div>
        <div className={styles.actions}>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Header title={title} onBack={() => navigate(-1)} />

      <div className={styles.wheelArea}>
        <CategoryWheel
          items={items}
          activeIndex={activeIndex}
          onChange={setPickedIndex}
          onView={handleView}
        />
      </div>

      <div className={styles.actions}>
        <Button onClick={() => handleView()}>자세히 보기</Button>
      </div>
    </main>
  );
}
