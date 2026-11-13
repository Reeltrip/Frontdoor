import { Fragment, type KeyboardEvent } from "react";
import openIcon from "@/shared/assets/icons/open-arrow.svg";
import copyIcon from "@/shared/assets/icons/copy-light.svg";
import { PLACE_EDIT_MAX_LENGTH, type PlaceDraft } from "../model/placeEdit";
import type { Place } from "../model/place.types";
import cardStyles from "./PlaceCard.module.css";
import styles from "./PlaceEditCard.module.css";

type PlaceEditCardProps = {
  place: Place;
  draft: PlaceDraft;
  onDraftChange: (draft: PlaceDraft) => void;
};

type AutoWidthInputProps = {
  value: string;
  placeholder: string;
  maxLength: number;
  label: string;
  className: string;
  hasUnderline?: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

function AutoWidthInput({
  value,
  placeholder,
  maxLength,
  label,
  className,
  hasUnderline = true,
  onChange,
  onKeyDown,
}: AutoWidthInputProps) {
  return (
    <span
      className={`${styles.sizer} ${className} ${hasUnderline ? styles.underline : ""}`}
      data-value={value || placeholder}
    >
      <input
        className={styles.input}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    </span>
  );
}

export default function PlaceEditCard({
  place,
  draft,
  onDraftChange,
}: PlaceEditCardProps) {
  const restParts = place.summary.slice(1);

  const update = (field: keyof PlaceDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.currentTarget.blur();
  };

  return (
    <article className={cardStyles.card}>
      <img src={place.imageUrl} alt="" className={cardStyles.photo} />
      <span className={cardStyles.shade} aria-hidden />

      <span className={cardStyles.openButton} aria-hidden>
        <img src={openIcon} alt="" />
      </span>

      <div className={cardStyles.info}>
        <div className={cardStyles.titleRow}>
          <AutoWidthInput
            className={styles.title}
            value={draft.name}
            placeholder="편집 중"
            maxLength={PLACE_EDIT_MAX_LENGTH.name}
            label="장소 이름"
            onChange={(value) => update("name", value)}
            onKeyDown={handleKeyDown}
          />
          <span className={cardStyles.copyButton} aria-hidden>
            <img src={copyIcon} alt="" />
          </span>
        </div>

        <div className={styles.summaryRow}>
          <AutoWidthInput
            className={styles.location}
            value={draft.location}
            placeholder="편집 중"
            maxLength={PLACE_EDIT_MAX_LENGTH.location}
            label="위치 설명"
            onChange={(value) => update("location", value)}
            onKeyDown={handleKeyDown}
          />
          {restParts.map((part) => (
            <Fragment key={part}>
              <span className={cardStyles.divider}> l </span>
              <span className={styles.restPart}>{part}</span>
            </Fragment>
          ))}
        </div>

        <div className={cardStyles.meta}>
          <span className={`${cardStyles.tag} ${styles.tagField}`}>
            <AutoWidthInput
              className={styles.tagInput}
              value={draft.tag}
              placeholder="편집"
              maxLength={PLACE_EDIT_MAX_LENGTH.tag}
              label="가격"
              hasUnderline={false}
              onChange={(value) => update("tag", value)}
              onKeyDown={handleKeyDown}
            />
          </span>
          {place.reviewCount !== undefined ? (
            <span className={styles.reviews}>
              {place.reviewCount.toLocaleString("en-US")} Reviews
            </span>
          ) : (
            <span className={cardStyles.memoButton}>+메모추가</span>
          )}
        </div>
      </div>
    </article>
  );
}
