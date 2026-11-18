import { useEffect, useState } from 'react';
import MapMarker, { type MapMarkerProps } from './MapMarker';
import styles from './GooglePlacePhotoMarker.module.css';

const THUMBNAIL_SIZE = 256;

type GooglePlacePhotoMarkerProps = {
  placeId: string;
  markerProps: MapMarkerProps;
};

export default function GooglePlacePhotoMarker({ placeId, markerProps }: GooglePlacePhotoMarkerProps) {
  const [photo, setPhoto] = useState<{ url: string; authors: google.maps.places.AuthorAttribution[] }>();
  const [isPhotoVisible, setIsPhotoVisible] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const load = async () => {
      try {
        const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
        if (!isCurrent) return;
        const place = new Place({ id: placeId });
        const { place: result } = await place.fetchFields({ fields: ['photos'] });
        const [firstPhoto] = result.photos ?? [];
        if (!isCurrent || !firstPhoto) return;
        const url = firstPhoto.getURI({ maxWidth: THUMBNAIL_SIZE, maxHeight: THUMBNAIL_SIZE });
        if (url) setPhoto({ url, authors: firstPhoto.authorAttributions });
      } catch {
        // 사진 조회가 실패해도 기본 핀과 장소 선택은 그대로 쓸 수 있어요.
      }
    };

    void load();
    return () => { isCurrent = false; };
  }, [placeId]);

  return (
    <div className={styles.marker}>
      <MapMarker
        {...markerProps}
        imageUrl={photo?.url ?? ''}
        onImageLoad={() => setIsPhotoVisible(true)}
        onImageError={() => {
          setIsPhotoVisible(false);
          setPhoto(undefined);
        }}
      />
      {isPhotoVisible && photo && photo.authors.length > 0 && (
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
