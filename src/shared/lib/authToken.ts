// 로그인 토큰 보관. 새로고침해도 로그인이 풀리지 않게 localStorage에 둬요.
// 시크릿 창 등에서 저장소를 못 쓰면 이 탭이 열려 있는 동안만 메모리에 둬요.
const ACCESS_KEY = 'reeltrip:access-token';
const REFRESH_KEY = 'reeltrip:refresh-token';

export type AuthTokens = { accessToken: string; refreshToken: string };

let memoryTokens: AuthTokens | null = null;
const expiredListeners = new Set<() => void>();

export function getAuthTokens(): AuthTokens | null {
  try {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (accessToken && refreshToken) return { accessToken, refreshToken };
  } catch {
    // 저장소를 못 쓰면 메모리 값을 써요
  }
  return memoryTokens;
}

export function hasAuthTokens(): boolean {
  return getAuthTokens() !== null;
}

export function setAuthTokens(tokens: AuthTokens) {
  memoryTokens = tokens;
  try {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  } catch {
    // 메모리에만 남아요
  }
}

export function clearAuthTokens() {
  memoryTokens = null;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // 지울 게 없어요
  }
}

/** 토큰이 만료돼 재발급도 실패했을 때 (로그인 화면으로 보내려고 씀) */
export function onAuthExpired(listener: () => void) {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
}

export function notifyAuthExpired() {
  clearAuthTokens();
  expiredListeners.forEach((listener) => listener());
}
