import { Fragment } from 'react';
import openIcon from '@/shared/assets/icons/open-arrow.svg';
import copyIcon from '@/shared/assets/icons/copy-light.svg';
import { displayOrDash, EMPTY_VALUE_TEXT, hasDisplayValue } from '@/shared/lib/displayValue';
import type { Place } from '../model/place.types';
import styles from './PlaceCard.module.css';

type PlaceCardProps = {
  place: Place;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  onAddMemo?: (place: Place) => void;
  className?: string;
};

// 사진 위에 정보가 올라간 큰 요약 카드 (보관함 목록). 추출하지 못한 항목은 '-'로 보여요 (기능명세서 5-2)
export default function PlaceCard({ place, onOpen, onCopy, onAddMemo, className }: PlaceCardProps) {
  const name = displayOrDash(place.name);
  const summary = place.summary.filter(hasDisplayValue);

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      {place.imageUrl && <img src={place.imageUrl} alt="" className={styles.photo} />}
      <span className={styles.shade} aria-hidden />

      <button
        type="button"
        className={styles.openButton}
        onClick={() => onOpen?.(place)}
        aria-label={`${name} 자세히 보기`}
      >
        <img src={openIcon} alt="" />
      </button>

      <div className={styles.info}>
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

        <p className={styles.summary}>
          {summary.length === 0 && EMPTY_VALUE_TEXT}
          {summary.map((part, index) => (
            <Fragment key={part}>
              {index > 0 && <span className={styles.divider}> l </span>}
              {part}
            </Fragment>
          ))}
        </p>

        <div className={styles.meta}>
          <span className={styles.tag}>{displayOrDash(place.tag)}</span>
          <button type="button" className={styles.memoButton} onClick={() => onAddMemo?.(place)}>
            +메모추가
          </button>
        </div>
      </div>
    </article>
  );
}
