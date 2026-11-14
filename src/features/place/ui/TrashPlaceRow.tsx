import { displayOrDash } from "@/shared/lib/displayValue";
import { CATEGORIES } from "../lib/categories";
import type { Place } from "../model/place.types";
import styles from "./TrashPlaceRow.module.css";

type TrashPlaceRowProps = {
  place: Place;
  isSelectable: boolean;
  isSelected: boolean;
  onToggle: () => void;
};

function CheckMark() {
  return (
    <svg
      className={styles.check}
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      role="img"
      aria-label="선택됨"
    >
      <circle cx="13" cy="13" r="13" fill="#BBB9B2" />
      <path
        d="M7.8 13.2L11.4 16.8L18.2 9.6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrashPlaceRow({
  place,
  isSelectable,
  isSelected,
  onToggle,
}: TrashPlaceRowProps) {
  const icon = CATEGORIES[place.category].icon;

  return (
    <li>
      <button
        type="button"
        className={`${styles.row} ${isSelected ? styles.selected : ""}`}
        aria-pressed={isSelectable ? isSelected : undefined}
        disabled={!isSelectable}
        onClick={onToggle}
      >
        <span className={styles.pill} aria-hidden>
          <span className={styles.shadow} />
        </span>
        <span className={styles.photoBox}>
          {place.imageUrl && (
            <img src={place.imageUrl} alt="" className={styles.photo} />
          )}
          {icon && (
            <img
              src={icon.src}
              alt=""
              className={`${styles.icon} ${icon.isFlipped ? styles.flipped : ""}`}
            />
          )}
        </span>
        <span className={styles.texts}>
          <span className={styles.name}>{displayOrDash(place.name)}</span>
          <span className={styles.description}>
            {displayOrDash(place.summary[0])}
          </span>
        </span>
        {isSelected && <CheckMark />}
      </button>
    </li>
  );
}
