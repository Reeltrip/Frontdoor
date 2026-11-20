import { apiRequest } from '@/shared/api/client';
import { hasAuthTokens } from '@/shared/lib/authToken';

/** 사진 올린 사람. 지도 스크립트(AuthorAttribution)와 서버 응답이 같이 쓰는 모양이에요 */
export type PhotoAuthor = { displayName: string; uri?: string | null };
export type GooglePlacePhoto = { url: string; authors: PhotoAuthor[] };

/** GET /place-photos 응답 (BE #85). 사진이 없는 장소는 photoUrl이 null이에요 */
type ServerPlacePhoto = { photoUrl: string | null; attributions: PhotoAuthor[] };

// 지도 마커와 카드가 같은 사진 주소를 써요. 크기를 하나로 맞춰야 브라우저 캐시를 같이 써서 사진을 한 번만 받아요.
// 카드 사진(280×140)이 2배 화면에서도 흐리지 않은 크기예요
const PHOTO_SIZE = 600;

// 같은 장소 사진을 마커·카드가 그릴 때마다 조회하지 않게 이 화면을 열어 둔 동안은 결과를 기억해요
// (Places 사진 조회는 과금돼요. 새로 고치면 다시 받아요)
const photoRequests = new Map<string, Promise<GooglePlacePhoto | undefined>>();

/**
 * 지도 스크립트가 있으면 그걸로, 없으면(요약카드처럼 지도가 없는 화면) 서버 GET /place-photos로 받아요 (#193).
 * 둘 다 못 쓰면(지도도 없고 로그인도 안 함) 조회하지 않고 undefined를 돌려줘요
 */
export function loadGooglePlacePhoto(placeId: string): Promise<GooglePlacePhoto | undefined> {
  const cached = photoRequests.get(placeId);
  if (cached) return cached;
  const hasMapScript = typeof google !== 'undefined' && Boolean(google.maps?.importLibrary);
  if (!hasMapScript && !hasAuthTokens()) return Promise.resolve(undefined);

  const request = (hasMapScript ? loadFromMapScript(placeId) : loadFromServer(placeId)).catch(() => {
    // 조회에 실패하면 다음에 다시 시도할 수 있게 기억하지 않아요
    photoRequests.delete(placeId);
    return undefined;
  });
  photoRequests.set(placeId, request);
  return request;
}

async function loadFromServer(placeId: string): Promise<GooglePlacePhoto | undefined> {
  const { photoUrl, attributions } = await apiRequest<ServerPlacePhoto>('/place-photos', {
    query: { googlePlaceId: placeId },
  });
  return photoUrl ? { url: photoUrl, authors: attributions ?? [] } : undefined;
}

async function loadFromMapScript(placeId: string): Promise<GooglePlacePhoto | undefined> {
  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
  const { place } = await new Place({ id: placeId }).fetchFields({ fields: ['photos'] });
  const [firstPhoto] = place.photos ?? [];
  const url = firstPhoto?.getURI({ maxWidth: PHOTO_SIZE, maxHeight: PHOTO_SIZE });
  return firstPhoto && url ? { url, authors: firstPhoto.authorAttributions } : undefined;
}
