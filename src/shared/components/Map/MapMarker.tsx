import styles from './MapMarker.module.css';

type MapMarkerProps = {
  imageUrl: string;
  name: string;
  /** sm: 기본 노드, lg: 선택한 노드 */
  size?: 'sm' | 'lg';
  /** 다른 일자에 이미 들어간 노드는 회색으로 */
  isMuted?: boolean;
  onClick?: () => void;
};

// 지도 위 장소 노드. 물방울 모양 안에 장소 사진을 넣음
export default function MapMarker({
  imageUrl,
  name,
  size = 'sm',
  isMuted = false,
  onClick,
}: MapMarkerProps) {
  const classNames = [styles.marker, styles[size], isMuted && styles.muted].filter(Boolean).join(' ');

  return (
    <button type="button" className={classNames} onClick={onClick} aria-label={name}>
      <span className={styles.pin} aria-hidden />
      <img src={imageUrl} alt="" className={styles.photo} />
    </button>
  );
}
