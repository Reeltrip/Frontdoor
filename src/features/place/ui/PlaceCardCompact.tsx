import openIcon from '@/shared/assets/icons/open-arrow-compact.svg';
import copyIcon from '@/shared/assets/icons/copy-dark.svg';
import { displayOrDash } from '@/shared/lib/displayValue';
import type { Place } from '../model/place.types';
import styles from './PlaceCardCompact.module.css';

type PlaceCardCompactProps = {
  place: Place;
  onOpen?: (place: Place) => void;
  onCopy?: (place: Place) => void;
  /** 여행계획에서 확정한 카드에만 넘겨요. 사진 위에 [플랜 B추가] 알약과 휴지통이 생겨요 */
  planBLabel?: string;
  onPlanB?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  className?: string;
};

// 흰 바탕 작은 요약 카드 (지도에서 노드를 눌렀을 때 아래에 뜨는 카드). 추출하지 못한 항목은 '-'로 보여요 (기능명세서 5-2)
export default function PlaceCardCompact({
  place,
  onOpen,
  onCopy,
  planBLabel,
  onPlanB,
  onRemove,
  className,
}: PlaceCardCompactProps) {
  const name = displayOrDash(place.name);

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.photoBox}>
        {place.imageUrl && <img src={place.imageUrl} alt="" className={styles.photo} />}
        {onPlanB && (
          <button type="button" className={styles.planBButton} onClick={() => onPlanB(place)}>
            {planBLabel ?? '플랜 B추가'}
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(place)}
            aria-label={`${name} 계획에서 제거`}
          >
            <svg viewBox="0 0 22 22" width="18" height="18" fill="none" aria-hidden>
              <path
                d="M18.1 5.2l-.5 9.2c-.2 2.3-.2 3.5-.8 4.4-.3.4-.7.7-1.1 1-.9.5-2.1.5-4.4.5s-3.6 0-4.5-.5c-.4-.3-.8-.6-1.1-1-.6-.9-.6-2.1-.8-4.4l-.5-9.2M3 5.2h16.5M7.6 5.2l.6-1.2c.4-.9.6-1.3 1-1.6.9-.5 3.1-.5 4 0 .3.3.5.7 1 1.6l.6 1.2M9 15.3V9.8M13.5 15.3V9.8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
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
