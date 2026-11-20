import { useEffect, useState } from 'react';
import { loadGooglePlacePhoto, type GooglePlacePhoto } from '@/shared/lib/googlePlacePhoto';

/**
 * 같은 링크에서 나온 카드는 BE가 링크 대표 이미지를 똑같이 넣어 줘서 사진이 모두 같아요.
 * 그래서 Google 장소 ID가 있으면 그 장소 사진을 먼저 보여주고, 없거나 받지 못하거나 깨지면 fallbackUrl을 보여줘요.
 * 돌려준 onLoad·onError를 img에 연결해 주세요. authors는 Google 사진이 실제로 보일 때만 채워져요 (출처 표시용)
 */
export function useGooglePlacePhoto(placeId: string | undefined, fallbackUrl: string) {
  const [loaded, setLoaded] = useState<{ placeId: string; photo: GooglePlacePhoto }>();
  const [brokenUrl, setBrokenUrl] = useState<string>();
  const [shownUrl, setShownUrl] = useState<string>();

  useEffect(() => {
    if (!placeId) return;
    let isCurrent = true;
    void loadGooglePlacePhoto(placeId).then((photo) => {
      if (isCurrent && photo) setLoaded({ placeId, photo });
    });
    return () => {
      isCurrent = false;
    };
  }, [placeId]);

  const photo = loaded && loaded.placeId === placeId && loaded.photo.url !== brokenUrl ? loaded.photo : undefined;
  const imageUrl = photo?.url ?? fallbackUrl;

  return {
    imageUrl,
    authors: photo && shownUrl === photo.url ? photo.authors : [],
    onLoad: () => setShownUrl(imageUrl),
    // Google 사진이 깨졌으면 카드 사진으로 돌아가요. 카드 사진이 깨진 건 여기서 할 수 있는 게 없어요
    onError: () => {
      setShownUrl(undefined);
      if (photo) setBrokenUrl(photo.url);
    },
  };
}
