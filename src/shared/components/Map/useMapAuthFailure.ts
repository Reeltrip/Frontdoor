import { useSyncExternalStore } from 'react';

declare global {
  interface Window {
    /** 키가 틀렸거나 허용되지 않은 주소에서 열면 Google Maps가 부르는 함수 */
    gm_authFailure?: () => void;
  }
}

// 지도 라이브러리가 인증 실패를 알려 주지 않아서 Google Maps의 전역 콜백을 직접 받아요.
// 한 번 실패하면 새로고침 전까지 다시 불러올 수 없어서 값은 되돌리지 않아요
let hasAuthFailed = false;
const listeners = new Set<() => void>();

const previousHandler = window.gm_authFailure;
window.gm_authFailure = () => {
  hasAuthFailed = true;
  listeners.forEach((notify) => notify());
  previousHandler?.();
};

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

/** 지도 키 인증에 실패했는지 (틀린 키, 리퍼러 제한에 걸린 주소 등) */
export function useMapAuthFailure(): boolean {
  return useSyncExternalStore(subscribe, () => hasAuthFailed);
}
