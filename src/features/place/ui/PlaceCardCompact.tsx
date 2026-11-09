import openIcon from '@/shared/assets/icons/open-arrow-compact.svg';
import copyIcon from '@/shared/assets/icons/copy-dark.svg';
import type { Place } from '../model/place.types';
import styles from './PlaceCardCompact.module.css';

type PlaceCardCompactProps = {
  place: Place;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  className?: string;
};

// 흰 바탕 작은 요약 카드 (지도에서 노드를 눌렀을 때 아래에 뜨는 카드)
export default function PlaceCardCompact({ place, onOpen, onCopy, className }: PlaceCardCompactProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.photoBox}>
        <img src={place.imageUrl} alt="" className={styles.photo} />
        <button
          type="button"
          className={styles.openButton}
          onClick={() => onOpen?.(place)}
          aria-label={`${place.name} 자세히 보기`}
        >
          <img src={openIcon} alt="" />
        </button>
      </div>

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

      {place.address && <p className={styles.address}>{place.address}</p>}

      {(place.tag || place.reviewCount !== undefined) && (
        <div className={styles.meta}>
          {place.tag && <span className={styles.tag}>{place.tag}</span>}
          {place.reviewCount !== undefined && (
            <span className={styles.reviews}>{place.reviewCount.toLocaleString()} Reviews</span>
          )}
        </div>
      )}
    </article>
  );
}
