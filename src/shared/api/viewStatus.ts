/** 화면에서 로딩·실패·빈 화면 중 무엇을 그릴지 */
export type ViewStatus = 'loading' | 'error' | 'empty' | 'success';

type QueryState<T> = {
  isPending: boolean;
  isError: boolean;
  data: T | undefined;
};

/**
 * 쿼리 상태를 화면 상태 하나로 줄여요.
 * 이미 받은 데이터가 있으면 다시 불러오다 실패해도 그 데이터를 계속 보여줘요.
 */
export function getViewStatus<T>(query: QueryState<T>, isEmpty: (data: T) => boolean = () => false): ViewStatus {
  if (query.data !== undefined) return isEmpty(query.data) ? 'empty' : 'success';
  if (query.isError) return 'error';
  return 'loading';
}
