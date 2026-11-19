import { useEffect, useState } from 'react';
import MapMarker, { type MapMarkerProps } from './MapMarker';
import styles from './GooglePlacePhotoMarker.module.css';

const THUMBNAIL_SIZE = 256;

type GooglePhoto = { url: string; authors: google.maps.places.AuthorAttribution[] };

type GooglePlacePhotoMarkerProps = {
  placeId: string;
  /** imageUrl은 Google 사진을 받는 동안과 받지 못했을 때 대신 보여주는 카드 사진이에요 */
  markerProps: MapMarkerProps;
  /** 사진 올린 사람 표시. 마커마다 다 띄우면 지도가 가려져서 선택한 마커에만 켜요 */
  showsCredits?: boolean;
};

// 마커는 지도를 움직이거나 선택이 바뀔 때마다 다시 그려져요. 같은 장소 사진을 그때마다 조회하지 않게
// 이 화면을 열어 둔 동안은 결과를 기억해요 (새로 고치면 다시 받아요)
const photoRequests = new Map<string, Promise<GooglePhoto | undefined>>();

function loadGooglePhoto(placeId: string): Promise<GooglePhoto | undefined> {
  const cached = photoRequests.get(placeId);
  if (cached) return cached;
  const request = (async () => {
    const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    const { place } = await new Place({ id: placeId }).fetchFields({ fields: ['photos'] });
    const [firstPhoto] = place.photos ?? [];
    const url = firstPhoto?.getURI({ maxWidth: THUMBNAIL_SIZE, maxHeight: THUMBNAIL_SIZE });
    return firstPhoto && url ? { url, authors: firstPhoto.authorAttributions } : undefined;
  })().catch(() => {
    // 조회에 실패하면 다음에 다시 시도할 수 있게 기억하지 않아요
    photoRequests.delete(placeId);
    return undefined;
  });
  photoRequests.set(placeId, request);
  return request;
}

// 같은 영상에서 나온 카드는 썸네일이 모두 같아서 마커가 구분되지 않아요.
// 그래서 Google 장소 사진을 먼저 보여주고, 없거나 받지 못하면 카드 사진을 보여줘요
export default function GooglePlacePhotoMarker({ placeId, markerProps, showsCredits = false }: GooglePlacePhotoMarkerProps) {
  const [photo, setPhoto] = useState<GooglePhoto>();
  const [isPhotoVisible, setIsPhotoVisible] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    void loadGooglePhoto(placeId).then((loaded) => {
      if (isCurrent && loaded) setPhoto(loaded);
    });
    return () => { isCurrent = false; };
  }, [placeId]);

  return (
    <div className={styles.marker}>
      <MapMarker
        {...markerProps}
        imageUrl={photo?.url ?? markerProps.imageUrl}
        onImageLoad={() => setIsPhotoVisible(Boolean(photo))}
        onImageError={() => {
          // Google 사진이 깨졌으면 카드 사진으로 돌아가요. 카드 사진이 깨진 건 여기서 할 수 있는 게 없어요
          setIsPhotoVisible(false);
          if (photo) setPhoto(undefined);
        }}
      />
      {showsCredits && isPhotoVisible && photo && photo.authors.length > 0 && (
        <ul className={styles.credits} aria-label="장소 사진 출처">
          {photo.authors.map(({ displayName, uri }, index) => (
            <li key={`${index}-${displayName}`}>
              {uri ? (
                <a href={uri} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                  {displayName}
                </a>
              ) : displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
