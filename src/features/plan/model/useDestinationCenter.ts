import { useQuery } from '@tanstack/react-query';
import { placeKeys, searchPlaces } from '@/features/place/api/places';
import type { MapPosition } from '@/shared/components/Map/map.types';
import { readDestinationCenter, rememberDestinationCenter } from '../lib/planMapCenter';

/**
 * 여행주소(예: 도쿄)의 좌표. 생성 화면에서 고를 때 적어 둔 값이 있으면 그걸 쓰고,
 * 없으면 장소 검색(Google 키는 BE에만 있어요)으로 한 번 찾아 적어 둬요
 */
export function useDestinationCenter(destination: string | undefined, { canSearch = true } = {}) {
  const name = destination?.trim() ?? '';
  const query = useQuery({
    queryKey: placeKeys.destinationCenter(name),
    queryFn: async ({ signal }): Promise<MapPosition | null> => {
      const [first] = await searchPlaces(name, signal);
      if (!first) return null;
      const center = { lat: first.latitude, lng: first.longitude };
      rememberDestinationCenter(name, center);
      return center;
    },
    enabled: name !== '' && canSearch,
    initialData: () => readDestinationCenter(name),
    staleTime: Infinity,
    retry: 1,
  });

  return {
    center: query.data ?? undefined,
    /** 찾는 중이면 true. 실패하거나 결과가 없으면 false가 돼요 */
    isPending: name !== '' && canSearch && query.isPending,
  };
}
