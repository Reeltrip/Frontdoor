import { Component } from 'react';
import type { ReactNode } from 'react';
import MapStatus from './MapStatus';

type MapErrorBoundaryProps = {
  children: ReactNode;
};

type MapErrorBoundaryState = {
  hasError: boolean;
};

// 키 인증에 실패하면 Google Maps가 안쪽을 비워서 마커·선을 만들다가 오류가 나요.
// 그 오류가 화면 전체를 죽이지 않게 지도 자리에서만 실패 화면으로 바꿔요.
// (렌더링 오류를 잡는 기능은 클래스 컴포넌트로만 만들 수 있어요)
export default class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? <MapStatus status="error" /> : this.props.children;
  }
}
