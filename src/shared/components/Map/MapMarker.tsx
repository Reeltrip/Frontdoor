import styles from './MapMarker.module.css';

type MapMarkerProps = {
  imageUrl: string;
  name: string;
  /** sm: 일반 크기, lg: 상세 확인 크기 */
  size?: 'sm' | 'lg';
  /** 다른 일자에 이미 들어간 노드는 회색으로 */
  isMuted?: boolean;
  onClick?: () => void;
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
          <span className={styles.pin} aria-hidden />
          {imageUrl && <img src={imageUrl} alt="" className={styles.photo} />}
          {categoryIcon && <span className={styles.category}><img src={categoryIcon} alt="" /></span>}
        </>
      )}
    </button>
  );
}
