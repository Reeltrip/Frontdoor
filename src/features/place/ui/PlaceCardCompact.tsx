import openIcon from '@/shared/assets/icons/open-arrow-compact.svg';
import copyIcon from '@/shared/assets/icons/copy-dark.svg';
import { displayOrDash } from '@/shared/lib/displayValue';
import type { Place } from '../model/place.types';
import styles from './PlaceCardCompact.module.css';

type PlaceCardCompactProps = {
  place: Place;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  className?: string;
};

// 흰 바탕 작은 요약 카드 (지도에서 노드를 눌렀을 때 아래에 뜨는 카드). 추출하지 못한 항목은 '-'로 보여요 (기능명세서 5-2)
export default function PlaceCardCompact({ place, onOpen, onCopy, className }: PlaceCardCompactProps) {
  const name = displayOrDash(place.name);

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.photoBox}>
        {place.imageUrl && <img src={place.imageUrl} alt="" className={styles.photo} />}
        <button
          type="button"
          className={styles.openButton}
          onClick={() => onOpen?.(place)}
          aria-label={`${name} 자세히 보기`}
        >
          <img src={openIcon} alt="" />
        </button>
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
          <span className={styles.reviews}>{place.reviewCount.toLocaleString()} Reviews</span>
        )}
      </div>
    </article>
  );
}
