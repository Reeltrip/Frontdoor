import { useGooglePlacePhoto } from '@/shared/hooks/useGooglePlacePhoto';
import MapMarker, { type MapMarkerProps } from './MapMarker';
import styles from './GooglePlacePhotoMarker.module.css';

type GooglePlacePhotoMarkerProps = {
  placeId: string;
  /** imageUrl은 Google 사진을 받는 동안과 받지 못했을 때 대신 보여주는 카드 사진이에요 */
  markerProps: MapMarkerProps;
  /** 사진 올린 사람 표시. 마커마다 다 띄우면 지도가 가려져서 선택한 마커에만 켜요 */
  showsCredits?: boolean;
};

// 같은 영상에서 나온 카드는 썸네일이 모두 같아서 마커가 구분되지 않아요.
// 그래서 Google 장소 사진을 먼저 보여주고, 없거나 받지 못하면 카드 사진을 보여줘요
export default function GooglePlacePhotoMarker({ placeId, markerProps, showsCredits = false }: GooglePlacePhotoMarkerProps) {
  const photo = useGooglePlacePhoto(placeId, markerProps.imageUrl);

  return (
    <div className={styles.marker}>
      <MapMarker
        {...markerProps}
        imageUrl={photo.imageUrl}
        onImageLoad={photo.onLoad}
        onImageError={photo.onError}
      />
      {showsCredits && photo.authors.length > 0 && (
        // 출처를 링크로 두면 겹친 아래 핀을 누를 때 링크가 눌려 Google 지도로 넘어가요.
        // 핀은 작아서 Google 정책상 이름만 보여줘도 돼요(프로필 링크는 "공간이 있을 때"). 터치는 아래로 통과시켜요
        <ul className={styles.credits} aria-label="장소 사진 출처">
          {photo.authors.map(({ displayName }, index) => (
            <li key={`${index}-${displayName}`}>{displayName}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
