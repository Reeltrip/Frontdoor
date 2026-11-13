import { useState } from 'react';
import Button from '@/shared/components/Button';
import { MapStatus, MapView } from '@/shared/components/Map';
import type { MapRouteStop } from '@/shared/components/Map';
import { toMapNodes } from '@/features/place/lib/mapNodes';
import type { Place } from '@/features/place/model/place.types';
import sampleFood from '@/shared/assets/images/sample-food.png';
import sampleHotel from '@/shared/assets/images/sample-hotel.jpg';
import sampleDonut from '@/shared/assets/images/sample-donut.jpg';
import styles from './MapWidgets.module.css';

// 가짜 데이터: 후쿠오카 실제 좌표(일본 국토지리원 주소 검색). 사진은 샘플 3장을 돌려 써요
const DEMO_PLACES: Place[] = [
  {
    id: 'map-hotel',
    category: 'accommodation',
    name: 'JR 큐슈 호텔 블라썸 하카타 센트럴',
    imageUrl: sampleHotel,
    location: { lat: 33.589813, lng: 130.417984 },
    summary: [],
  },
  {
    id: 'map-ramen',
    category: 'food',
    name: '하카타 잇소 (博多一双)',
    imageUrl: sampleFood,
    location: { lat: 33.586388, lng: 130.425186 },
    summary: [],
  },
  {
    id: 'map-canal',
    category: 'shopping',
    name: '캐널시티 하카타',
    imageUrl: sampleHotel,
    location: { lat: 33.589874, lng: 130.411911 },
    summary: [],
  },
  {
    id: 'map-temple',
    category: 'attraction',
    name: '도초지',
    imageUrl: sampleFood,
    location: { lat: 33.594616, lng: 130.414169 },
    summary: [],
  },
  {
    id: 'map-donut',
    category: 'cafe',
    name: "I'm donut? 후쿠오카 텐진점",
    imageUrl: sampleDonut,
    location: { lat: 33.588314, lng: 130.402252 },
    summary: [],
  },
  {
    id: 'map-shrine',
    category: 'attraction',
    name: '스미요시 신사',
    imageUrl: sampleDonut,
    location: { lat: 33.58569, lng: 130.411972 },
    summary: [],
  },
  // 아래 둘은 좌표가 있어도 지도에 올라가지 않아야 해요
  {
    id: 'map-tip',
    category: 'tip',
    name: '후쿠오카 투어리스트 시티 패스',
    imageUrl: sampleFood,
    location: { lat: 33.5897, lng: 130.4207 },
    summary: [],
  },
  {
    id: 'map-subway',
    category: 'transportation',
    name: '지하철 공항선',
    imageUrl: sampleFood,
    location: { lat: 33.5903, lng: 130.4017 },
    summary: [],
  },
];

/** 다른 일자에 이미 들어간 것으로 치는 노드 */
const MUTED_PLACE_ID = 'map-shrine';

// 숙소 → 라멘 → 캐널시티(플랜B: 도초지) → 도넛
const DEMO_ROUTE: MapRouteStop[] = [
  { nodeId: 'map-hotel' },
  { nodeId: 'map-ramen' },
  { nodeId: 'map-canal', planBNodeId: 'map-temple' },
  { nodeId: 'map-donut' },
];

const DEMO_CENTER = { lat: 33.5902, lng: 130.4135 };

export function MapRouteDemo() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('map-canal');
  const [isRouteShown, setIsRouteShown] = useState(true);
  const [isPlanBShown, setIsPlanBShown] = useState(true);

  const nodes = toMapNodes(DEMO_PLACES).map((node) => ({ ...node, isMuted: node.id === MUTED_PLACE_ID }));
  const route = isPlanBShown ? DEMO_ROUTE : DEMO_ROUTE.map(({ nodeId }) => ({ nodeId }));
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Button
          size="sm"
          variant={isRouteShown ? 'filled' : 'outline'}
          isFullWidth={false}
          onClick={() => setIsRouteShown(!isRouteShown)}
        >
          동선
        </Button>
        <Button
          size="sm"
          variant={isPlanBShown ? 'filled' : 'outline'}
          isFullWidth={false}
          disabled={!isRouteShown}
          onClick={() => setIsPlanBShown(!isPlanBShown)}
        >
          플랜B
        </Button>
      </div>

      <div className={styles.map}>
        <MapView
          center={DEMO_CENTER}
          zoom={14}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          route={isRouteShown ? route : undefined}
          onSelectNode={setSelectedNodeId}
          onClickMap={() => setSelectedNodeId(null)}
        />
      </div>

      <p className={styles.status}>선택한 노드: {selectedNode?.name ?? '없음 (노드를 눌러 보세요)'}</p>
      <p className={styles.note}>
        장소 {DEMO_PLACES.length}개 중 노드 {nodes.length}개 (교통·팁 카드는 지도에 안 올라가요). 회색 노드는 다른
        일자에 들어간 스미요시 신사, 검은 선은 확정한 동선, 라임색 선은 플랜B(도초지)예요.
      </p>
    </div>
  );
}

type MapStatusDemoProps = {
  status: 'loading' | 'error' | 'noKey';
};

export function MapStatusDemo({ status }: MapStatusDemoProps) {
  return (
    <div className={styles.statusBox}>
      <MapStatus status={status} />
    </div>
  );
}
