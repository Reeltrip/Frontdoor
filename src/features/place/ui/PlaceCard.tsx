import { Fragment } from 'react';
import openIcon from '@/shared/assets/icons/open-arrow.svg';
import copyIcon from '@/shared/assets/icons/copy-light.svg';
import { displayOrDash, EMPTY_VALUE_TEXT, hasDisplayValue } from '@/shared/lib/displayValue';
import { useGooglePlacePhoto } from '@/shared/hooks/useGooglePlacePhoto';
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
  // 한 링크에서 나온 카드는 영상 썸네일이 모두 같아요. 지도 핀처럼 Google 장소 사진을 먼저 보여줘요 (#193)
  const photo = useGooglePlacePhoto(place.googlePlaceId, place.imageUrl);

  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      {photo.imageUrl && (
        <img
          src={photo.imageUrl}
          alt=""
          className={styles.photo}
          onLoad={photo.onLoad}
          onError={photo.onError}
        />
      )}
      <span className={styles.shade} aria-hidden />
      {photo.authors.length > 0 && (
        // Google 장소 사진은 올린 사람을 함께 보여줘야 해요
        <p className={styles.credits}>사진: {photo.authors.map(({ displayName }) => displayName).join(', ')}</p>
      )}

      <button
        type="button"
        className={styles.openButton}
        onClick={() => onOpen?.(place)}
        aria-label={`${name} 원본 링크 새 탭에서 열기`}
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
          {place.reviewCount !== undefined && (
            <span className={styles.reviews}>{place.reviewCount.toLocaleString('en-US')} Reviews</span>
          )}
          <button type="button" className={styles.memoButton} onClick={() => onAddMemo?.(place)}>
            +메모추가
          </button>
        </div>
      </div>
    </article>
  );
}
