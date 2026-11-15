import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "@/shared/components/Button";
import Header from "@/shared/components/Header";
import CategoryWheel from "@/features/place/ui/CategoryWheel";
import {
  FAKE_RESULT_CATEGORIES,
  FAKE_RESULT_INITIAL_INDEX,
  FAKE_RESULT_REGION,
} from "@/features/place/api/fakeResult";
import styles from "./ResultPage.module.css";
import type { ResultCategoryItem } from "@/features/place/model/result.types";

export default function ResultPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(FAKE_RESULT_INITIAL_INDEX);
  const handleView = (item?: ResultCategoryItem) => {
    const categoryIndex = item
      ? FAKE_RESULT_CATEGORIES.indexOf(item)
      : activeIndex;
    navigate("/cards", { state: { categoryIndex } });
  };

  return (
    <main className={styles.page}>
      <Header title={FAKE_RESULT_REGION} onBack={() => navigate(-1)} />

      <div className={styles.wheelArea}>
        <CategoryWheel
          items={FAKE_RESULT_CATEGORIES}
          activeIndex={activeIndex}
          onChange={setActiveIndex}
          onView={handleView}
        />
      </div>

      <div className={styles.actions}>
        <Button onClick={() => handleView()}>자세히 보기</Button>
      </div>
    </main>
  );
}
