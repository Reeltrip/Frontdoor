import { useEffect, useMemo } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  Map as GoogleMap,
  Polyline,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import MapErrorBoundary from './MapErrorBoundary';
import MapMarker, { type MapMarkerProps } from './MapMarker';
import GooglePlacePhotoMarker from './GooglePlacePhotoMarker';
import MapStatus from './MapStatus';
import { buildRoutePaths } from './mapRoute';
import { useMapAuthFailure } from './useMapAuthFailure';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } from './mapConfig';
import type { MapNode, MapPosition, MapRouteStop } from './map.types';
import styles from './MapView.module.css';

export type MapViewProps = {
  /** 지도 중심. 값이 바뀌면 그 위치로 옮겨 가요. 기본은 후쿠오카 */
  center?: MapPosition;
  /** 확대 정도 (숫자가 클수록 가까이). 값이 바뀌면 그 값으로 맞춰요 */
  zoom?: number;
  /** 지도에 올릴 노드. 교통·팁 카드는 넣지 않아요 */
  nodes: MapNode[];
  /** 선택한 노드. 큰 핀으로 맨 위에 그려요 */
  selectedNodeId?: string | null;
  /** 동선. 확정한 순서대로 넣어요. 비우면 선을 그리지 않아요 */
  route?: MapRouteStop[];
  onSelectNode?: (nodeId: string) => void;
  /** 노드가 아닌 지도 바탕을 눌렀을 때 (선택 풀기 등) */
  onClickMap?: () => void;
  className?: string;
  /** 여행계획 편집에서 쓰는 동선 색과 사진 핀 상태 */
  isPlanning?: boolean;
  highlightedNodeId?: string | null;
  enlargeSelectedNode?: boolean;
};

const ROUTE_STROKE_WEIGHT = 4;

// 선 색은 CSS가 아니라 지도 API에 값으로 넘겨야 해서 디자인 토큰을 읽어 와요
const readColorToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const getNodeZIndex = (node: MapNode, isSelected: boolean) => {
  if (isSelected) return 3;
  return node.isMuted ? 1 : 2;
};

type MapCameraProps = Required<Pick<MapViewProps, 'center' | 'zoom'>>;

// 사용자가 지도를 직접 움직일 수 있게 두고, props가 바뀔 때만 카메라를 옮겨요
function MapCamera({ center, zoom }: MapCameraProps) {
  const map = useMap();
  const { lat, lng } = center;

  useEffect(() => {
    map?.panTo({ lat, lng });
  }, [map, lat, lng]);

  useEffect(() => {
    map?.setZoom(zoom);
  }, [map, zoom]);

  return null;
}

type MapRouteLinesProps = {
  nodes: MapNode[];
  route: MapRouteStop[];
  isPlanning?: boolean;
};

function MapRouteLines({ nodes, route, isPlanning }: MapRouteLinesProps) {
  const { mainPaths, inactivePaths, previewPath } = useMemo(() => buildRoutePaths(nodes, route), [nodes, route]);
  const colors = useMemo(
    () => ({
      main: readColorToken(isPlanning ? '--color-plan-route' : '--color-gray-900'),
      dash: readColorToken('--color-surface'),
      shadow: readColorToken('--color-gray-900'),
    }),
    [isPlanning],
  );

  const dash = {
    path: 'M 0,-1 0,1',
    strokeColor: colors.dash,
    strokeWeight: ROUTE_STROKE_WEIGHT,
    strokeOpacity: 1,
    scale: 3.5,
  };
  const repeat = '15px';

  return (
    <>
      {inactivePaths.map((path, index) => (
        <Polyline
          key={index}
          path={path}
          strokeColor={colors.dash}
          strokeOpacity={0}
          icons={[
            { icon: { ...dash, strokeColor: colors.shadow, strokeWeight: 6, strokeOpacity: 0.28 }, offset: '0', repeat },
            { icon: dash, offset: '0', repeat },
          ]}
          zIndex={1}
          clickable={false}
        />
      ))}
      {mainPaths.map((path, index) => (
        <Polyline key={index} path={path} strokeColor={colors.main} strokeWeight={ROUTE_STROKE_WEIGHT} zIndex={2} clickable={false} />
      ))}
      {previewPath && (
        <Polyline path={previewPath} strokeColor={colors.main} strokeWeight={ROUTE_STROKE_WEIGHT} zIndex={3} clickable={false} />
      )}
    </>
  );
}

function MapContent({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  nodes,
  selectedNodeId,
  route,
  onSelectNode,
  onClickMap,
  isPlanning,
  highlightedNodeId,
  enlargeSelectedNode = !isPlanning,
}: Omit<MapViewProps, 'className'>) {
  const loadingStatus = useApiLoadingStatus();
  const hasAuthFailed = useMapAuthFailure();
  const routeIds = new Set(route?.map((stop) => stop.isPlanBPreview ? stop.planBNodeId : stop.nodeId));
  const inactiveIds = new Set(route?.map((stop) => stop.isPlanBPreview ? stop.nodeId : stop.planBNodeId));
  const previewId = route?.find((stop) => stop.isPlanBPreview)?.planBNodeId;

  if (hasAuthFailed || loadingStatus === APILoadingStatus.FAILED) {
    return <MapStatus status="error" />;
  }

  return (
    <>
      <GoogleMap
        mapId={GOOGLE_MAPS_MAP_ID}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        onClick={onClickMap}
        className={styles.map}
      >
        <MapCamera center={center} zoom={zoom} />
        {route && <MapRouteLines nodes={nodes} route={route} isPlanning={isPlanning} />}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isOnRoute = routeIds.has(node.id);
          const markerProps: MapMarkerProps = {
            imageUrl: node.imageUrl,
            name: node.name,
            size: isSelected && enlargeSelectedNode ? 'lg' : 'sm',
            isMuted: node.isMuted,
            isPlanning,
            isSelected,
            isRouteStop: isOnRoute,
            isInactiveRoute: inactiveIds.has(node.id),
            isHighlighted: node.id === (previewId ?? highlightedNodeId),
            isDot: node.isDot,
            categoryIcon: node.categoryIcon,
          };
          const photoPlaceId =
            isSelected && !node.isDot && !node.imageUrl && loadingStatus === APILoadingStatus.LOADED
              ? node.googlePlaceId
              : undefined;

          return (
            <AdvancedMarker
              key={node.id}
              position={node.position}
              title={node.name}
              zIndex={isOnRoute && !isSelected ? 3 : getNodeZIndex(node, isSelected) + (isSelected ? 1 : 0)}
              className={node.isDot ? undefined : styles.node}
              onClick={() => onSelectNode?.(node.id)}
            >
              {photoPlaceId
                ? <GooglePlacePhotoMarker key={photoPlaceId} placeId={photoPlaceId} markerProps={markerProps} />
                : <MapMarker {...markerProps} />}
            </AdvancedMarker>
          );
        })}
      </GoogleMap>
      {loadingStatus !== APILoadingStatus.LOADED && <MapStatus status="loading" isOverlay />}
    </>
  );
}

/**
 * 보관함과 여행계획이 같이 쓰는 공통 지도.
 * 받은 노드·선택·동선을 그리기만 하고, 무엇을 확정했는지 같은 기능 로직은 화면 쪽에 둬요.
 * 크기는 부모를 꽉 채우니 부모에 높이를 정해 주세요.
 */
export default function MapView({ className, ...contentProps }: MapViewProps) {
  const classNames = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {GOOGLE_MAPS_API_KEY ? (
        <MapErrorBoundary>
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="ko">
            <MapContent {...contentProps} />
          </APIProvider>
        </MapErrorBoundary>
      ) : (
        <MapStatus status="noKey" />
      )}
    </div>
  );
}
