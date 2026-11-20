export type GooglePlacePhoto = { url: string; authors: google.maps.places.AuthorAttribution[] };

// 지도 마커와 카드가 같은 사진 주소를 써요. 크기를 하나로 맞춰야 브라우저 캐시를 같이 써서 사진을 한 번만 받아요.
// 카드 사진(280×140)이 2배 화면에서도 흐리지 않은 크기예요
const PHOTO_SIZE = 600;

// 같은 장소 사진을 마커·카드가 그릴 때마다 조회하지 않게 이 화면을 열어 둔 동안은 결과를 기억해요
// (Places 사진 조회는 과금돼요. 새로 고치면 다시 받아요)
const photoRequests = new Map<string, Promise<GooglePlacePhoto | undefined>>();

/** Google 지도 스크립트가 아직 없으면(지도를 연 적이 없으면) 조회하지 않고 undefined를 돌려줘요 */
export function loadGooglePlacePhoto(placeId: string): Promise<GooglePlacePhoto | undefined> {
  const cached = photoRequests.get(placeId);
  if (cached) return cached;
  if (typeof google === 'undefined' || !google.maps?.importLibrary) return Promise.resolve(undefined);

  const request = (async () => {
    const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
    const { place } = await new Place({ id: placeId }).fetchFields({ fields: ['photos'] });
    const [firstPhoto] = place.photos ?? [];
    const url = firstPhoto?.getURI({ maxWidth: PHOTO_SIZE, maxHeight: PHOTO_SIZE });
    return firstPhoto && url ? { url, authors: firstPhoto.authorAttributions } : undefined;
  })().catch(() => {
    // 조회에 실패하면 다음에 다시 시도할 수 있게 기억하지 않아요
    photoRequests.delete(placeId);
    return undefined;
  });
  photoRequests.set(placeId, request);
  return request;
}
