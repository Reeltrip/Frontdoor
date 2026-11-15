// 가짜 응답 도구: BE API가 정해지기 전까지 화면을 만들려고 씀.
// .env에서 VITE_USE_FAKE_API=false로 바꾸면 각 api 파일이 실제 서버로 요청해요.

export const FAKE_DELAY_MS = 600;

type FakeOptions = {
  delayMs?: number;
  signal?: AbortSignal;
};

/**
 * 지연 뒤에 getData() 결과를 돌려줘요. getData가 ApiError를 던지면 실패 응답이 돼요.
 * 결과는 복사해서 돌려줘서, 화면 캐시를 고쳐도 가짜 저장소는 바뀌지 않아요.
 */
export function fakeResponse<T>(getData: () => T, { delayMs = FAKE_DELAY_MS, signal }: FakeOptions = {}) {
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('요청이 취소됐어요.', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      try {
        resolve(structuredClone(getData()));
      } catch (error) {
        reject(error);
      }
    }, delayMs);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
