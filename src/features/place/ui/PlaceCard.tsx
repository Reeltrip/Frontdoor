import { Fragment } from 'react';
import openIcon from '@/shared/assets/icons/open-arrow.svg';
import copyIcon from '@/shared/assets/icons/copy-light.svg';
import type { Place } from '../model/place.types';
import styles from './PlaceCard.module.css';

type PlaceCardProps = {
  place: Place;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  onAddMemo?: (place: Place) => void;
  className?: string;
};

// 사진 위에 정보가 올라간 큰 요약 카드 (보관함 목록)
export default function PlaceCard({ place, onOpen, onCopy, onAddMemo, className }: PlaceCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <img src={place.imageUrl} alt="" className={styles.photo} />
      <span className={styles.shade} aria-hidden />

      <button
        type="button"
        className={styles.openButton}
        onClick={() => onOpen?.(place)}
        aria-label={`${place.name} 자세히 보기`}
      >
        <img src={openIcon} alt="" />
      </button>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{place.name}</h3>
          <button
            type="button"
            className={styles.copyButton}
            onClick={() => onCopy?.(place)}
            aria-label={`${place.name} 복사`}
          >
            <img src={copyIcon} alt="" />
          </button>
        </div>

        <p className={styles.summary}>
          {place.summary.map((part, index) => (
            <Fragment key={part}>
              {index > 0 && <span className={styles.divider}> l </span>}
              {part}
            </Fragment>
          ))}
        </p>

        <div className={styles.meta}>
          {place.tag && <span className={styles.tag}>{place.tag}</span>}
          <button type="button" className={styles.memoButton} onClick={() => onAddMemo?.(place)}>
            +메모추가
          </button>
        </div>
      </div>
    </article>
  );
}
