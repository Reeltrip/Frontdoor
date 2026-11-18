import styles from './MapMarker.module.css';

export type MapMarkerProps = {
  imageUrl: string;
  name: string;
  /** sm: 일반 크기, lg: 상세 확인 크기 */
  size?: 'sm' | 'lg';
  /** 다른 일자에 이미 들어간 노드는 회색으로 */
  isMuted?: boolean;
  onClick?: () => void;
  onImageLoad?: () => void;
  onImageError?: () => void;
  isPlanning?: boolean;
  isSelected?: boolean;
  isInactiveRoute?: boolean;
  isHighlighted?: boolean;
  isDot?: boolean;
  categoryIcon?: string;
};

// 지도 위 장소 노드. 물방울 모양 안에 장소 사진을 넣음
export default function MapMarker({
  imageUrl,
  name,
  size = 'sm',
  isMuted = false,
  onClick,
  onImageLoad,
  onImageError,
  isPlanning,
  isSelected = false,
  isInactiveRoute,
  isHighlighted,
  isDot,
  categoryIcon,
}: MapMarkerProps) {
  const classNames = [
    styles.marker, styles[size], isMuted && styles.muted,
    isPlanning && styles.planning, isDot && styles.dot,
    isSelected && styles.selected, isInactiveRoute && styles.inactiveRoute,
    isSelected && isHighlighted && styles.highlighted,
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={classNames} onClick={onClick} aria-label={name} aria-pressed={isSelected}>
      {!isDot && (
        <>
          <svg className={styles.pin} viewBox="0 0 65 76" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M32.5 0C50.45 0 65 14.55 65 32.5c0 16.7-10.1 29.5-24.9 39.5-3.3 2.2-5.5 3.5-7.6 3.5s-4.3-1.3-7.6-3.5C10.1 62 0 49.2 0 32.5 0 14.55 14.55 0 32.5 0Z"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {imageUrl && <img src={imageUrl} alt="" className={styles.photo} onLoad={onImageLoad} onError={onImageError} />}
          {categoryIcon && <span className={styles.category}><img src={categoryIcon} alt="" /></span>}
        </>
      )}
    </button>
  );
}
