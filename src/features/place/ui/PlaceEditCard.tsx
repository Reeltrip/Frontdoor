import { useGooglePlacePhoto } from "@/shared/hooks/useGooglePlacePhoto";
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
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

function AutoWidthInput({
  value,
  placeholder,
  maxLength,
  label,
  className,
  onChange,
  onKeyDown,
}: AutoWidthInputProps) {
  return (
    <span
      // 빈 칸은 고치는 중이라 안내 문구도 굵게 보여요 (피그마 '편집 중 ㅣ')
      className={`${styles.sizer} ${className} ${value ? "" : styles.isEmpty}`}
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

  // 보기 카드와 같은 사진을 보여줘요 (#193)
  const photo = useGooglePlacePhoto(place.googlePlaceId, place.imageUrl);

  return (
    <article className={cardStyles.card}>
      {photo.imageUrl && (
        <img
          src={photo.imageUrl}
          alt=""
          className={cardStyles.photo}
          onLoad={photo.onLoad}
          onError={photo.onError}
        />
      )}
      <span className={cardStyles.shade} aria-hidden />
      {photo.authors.length > 0 && (
        <p className={cardStyles.credits}>사진: {photo.authors.map(({ displayName }) => displayName).join(", ")}</p>
      )}

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
              placeholder="가격 입력중"
              maxLength={PLACE_EDIT_MAX_LENGTH.tag}
              label="가격"
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
