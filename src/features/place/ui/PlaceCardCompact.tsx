import openIcon from "@/shared/assets/icons/open-arrow-compact.svg";
import trashIcon from "@/shared/assets/icons/trash-compact.svg";
import copyIcon from "@/shared/assets/icons/copy-dark.svg";
import { displayOrDash } from "@/shared/lib/displayValue";
import type { Place } from "../model/place.types";
import styles from "./PlaceCardCompact.module.css";
import openPillIcon from "@/shared/assets/icons/open-arrow-pill.svg";

type PlaceCardCompactProps = {
  place: Place;
  onPick?: (place: Place) => void;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  /** 여행계획에서 확정한 카드에만 넘겨요. 사진 위에 [플랜 B추가] 알약과 휴지통이 생겨요 */
  planBLabel?: string;
  onPlanB?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  onDelete?: (place: Place) => void;
  className?: string;
};

// 흰 바탕 작은 요약 카드 (지도에서 노드를 눌렀을 때 아래에 뜨는 카드). 추출하지 못한 항목은 '-'로 보여요 (기능명세서 5-2)
export default function PlaceCardCompact({
  place,
  onPick,
  onOpen,
  onCopy,
  planBLabel,
  onPlanB,
  onRemove,
  onDelete,
  className,
}: PlaceCardCompactProps) {
  const name = displayOrDash(place.name);

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <div className={styles.photoBox}>
        {place.imageUrl && (
          <img src={place.imageUrl} alt="" className={styles.photo} />
        )}
        {onPick && (
          <button
            type="button"
            className={styles.pickButton}
            onClick={() => onPick(place)}
            aria-label={`${name} 선택`}
          />
        )}
        {onPlanB && (
          <button
            type="button"
            className={styles.planBButton}
            onClick={() => onPlanB(place)}
          >
            {planBLabel ?? "플랜 B추가"}
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(place)}
            aria-label={`${name} 계획에서 제거`}
          >
            <img src={trashIcon} alt="" />
          </button>
        )}
        {onDelete ? (
          <div className={styles.actionPill}>
            <button
              type="button"
              className={styles.pillButton}
              onClick={() => onDelete(place)}
              aria-label={`${name} 삭제`}
            >
              <img src={trashIcon} alt="" />
            </button>
            <button
              type="button"
              className={styles.pillButton}
              onClick={() => onOpen?.(place)}
              aria-label={`${name} 원본 링크 새 탭에서 열기`}
            >
              <img src={openPillIcon} alt="" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.openButton}
            onClick={() => onOpen?.(place)}
            aria-label={`${name} 원본 링크 새 탭에서 열기`}
          >
            <img src={openIcon} alt="" />
          </button>
        )}
      </div>

      <div className={styles.titleRow}>
        <h3 className={styles.title}>{name}</h3>
        <button
          type="button"
          className={styles.copyButton}
          onClick={() => onCopy?.(place)}
          aria-label={`${name} 복사`}
        >
          <img src={copyIcon} alt="" />
        </button>
      </div>

      <p className={styles.address}>{displayOrDash(place.address)}</p>

      <div className={styles.meta}>
        <span className={styles.tag}>{displayOrDash(place.tag)}</span>
        {/* 리뷰 수는 없으면 숨김: '- Reviews'는 뜻이 없어서 */}
        {place.reviewCount !== undefined && (
          <span className={styles.reviews}>
            {place.reviewCount.toLocaleString()} Reviews
          </span>
        )}
      </div>
    </article>
  );
}
