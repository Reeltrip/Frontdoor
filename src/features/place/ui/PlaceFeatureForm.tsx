import { useRef, useState, type ChangeEvent } from "react";
import {
  FEATURE_TAG_MAX_COUNT,
  FEATURE_TEXT_MAX_LENGTH,
  type CardFeatures,
} from "../model/cardAdd.types";
import styles from "./PlaceFeatureForm.module.css";
import photoUploadIcon from "@/shared/assets/icons/photo-upload.svg";

type PlaceFeatureFormProps = {
  value: CardFeatures;
  onChange: (next: CardFeatures) => void;
};

export default function PlaceFeatureForm({
  value,
  onChange,
}: PlaceFeatureFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tagText, setTagText] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(true);
  const isTagInputVisible = value.tags.length === 0 || isAddingTag;
  const isTagFull = value.tags.length >= FEATURE_TAG_MAX_COUNT;

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (value.photoUrl) URL.revokeObjectURL(value.photoUrl);
    onChange({ ...value, photoUrl: URL.createObjectURL(file) });
  };

  const handleTagButton = () => {
    const text = tagText.trim();
    if (isTagInputVisible && text) {
      onChange({ ...value, tags: [...value.tags, text] });
      setTagText("");
      setIsAddingTag(false);
      return;
    }
    setIsAddingTag((isAdding) => !isAdding);
  };

  const removeTag = (index: number) => {
    onChange({
      ...value,
      tags: value.tags.filter((_, tagIndex) => tagIndex !== index),
    });
  };

  return (
    <div className={styles.form}>
      <button
        type="button"
        className={styles.photo}
        onClick={() => fileRef.current?.click()}
      >
        {value.photoUrl ? (
          <img
            src={value.photoUrl}
            alt="고른 사진"
            className={styles.photoPreview}
          />
        ) : (
          <>
            <img src={photoUploadIcon} alt="" className={styles.photoIcon} />
            <span className={styles.photoText}>
              여기를 클릭해 사진을 업로드 하세요.
            </span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhoto}
      />

      <div className={styles.tags}>
        {value.tags.map((tag, index) => (
          <button
            key={`${tag}-${index}`}
            type="button"
            className={styles.tag}
            onClick={() => removeTag(index)}
            aria-label={`${tag} 삭제`}
          >
            {tag}
          </button>
        ))}
        {isTagInputVisible && !isTagFull && (
          <input
            className={styles.tagInput}
            value={tagText}
            maxLength={FEATURE_TEXT_MAX_LENGTH}
            placeholder="대표메뉴를 입력해주세요."
            onChange={(event) => setTagText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              handleTagButton();
            }}
          />
        )}
        <button
          type="button"
          className={styles.addTag}
          onClick={handleTagButton}
          disabled={isTagFull}
          aria-label="특징 추가"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M10 3.5v13M16.5 10h-13"
              stroke="#808080"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={value.price}
          maxLength={FEATURE_TEXT_MAX_LENGTH}
          placeholder="가격을 입력해주세요."
          onChange={(event) =>
            onChange({ ...value, price: event.target.value })
          }
        />
        <p className={styles.counter}>
          ({value.price.length}/{FEATURE_TEXT_MAX_LENGTH})
        </p>
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={value.memo}
          maxLength={FEATURE_TEXT_MAX_LENGTH}
          placeholder="추가 메모 사항"
          onChange={(event) => onChange({ ...value, memo: event.target.value })}
        />
        <p className={styles.counter}>
          ({value.memo.length}/{FEATURE_TEXT_MAX_LENGTH})
        </p>
      </div>
    </div>
  );
}
