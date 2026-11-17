import type { Place } from '@/features/place/model/place.types';
import type { Plan } from './plan.types';

/**
 * 보관함 카드에 계획 응답의 카드를 더해요. 같은 카드는 내용이 더 많은 보관함 카드를 써요.
 * 공유받은 계획이나 로그인 없이 보는 계획은 보관함에 그 카드가 없어서 필요해요.
 */
export function mergePlanPlaces(libraryPlaces: Place[], plan: Plan | undefined): Place[] {
  const libraryIds = new Set(libraryPlaces.map((place) => place.id));
  const extra = (plan?.embeddedPlaces ?? []).filter((place) => !libraryIds.has(place.id));
  return extra.length > 0 ? [...libraryPlaces, ...extra] : libraryPlaces;
}
