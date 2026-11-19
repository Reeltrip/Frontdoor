import type { MapPosition } from './map.types';

/** Google encoded polyline의 좌표 한 칸. 소수 다섯째 자리까지 담겨 있어요 */
const PRECISION = 1e5;

/**
 * 서버가 내려준 길 모양(Google encoded polyline)을 좌표 목록으로 풀어요.
 * 값이 없거나 중간에 끊겼으면 빈 목록을 돌려줘요. 그러면 지도는 그 구간을 직선으로 그려요.
 */
export function decodePolyline(encoded: string | null | undefined): MapPosition[] {
  if (!encoded) return [];
  const points: MapPosition[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  // 숫자 하나를 읽어요. 5비트씩 끊어 담겨 있고, 0x20 비트가 꺼진 조각이 마지막이에요
  const readDelta = (): number | null => {
    let result = 0;
    let shift = 0;
    while (index < encoded.length) {
      const chunk = encoded.charCodeAt(index) - 63;
      index += 1;
      if (chunk < 0 || chunk > 63) return null;
      result |= (chunk & 0x1f) << shift;
      shift += 5;
      if (chunk < 0x20) return result & 1 ? ~(result >> 1) : result >> 1;
    }
    return null;
  };

  while (index < encoded.length) {
    const deltaLat = readDelta();
    const deltaLng = deltaLat === null ? null : readDelta();
    if (deltaLat === null || deltaLng === null) return [];
    lat += deltaLat;
    lng += deltaLng;
    points.push({ lat: lat / PRECISION, lng: lng / PRECISION });
  }
  return points;
}
