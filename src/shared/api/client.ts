import { API_BASE_URL } from '@/shared/lib/env';
import { getAuthTokens, notifyAuthExpired, setAuthTokens } from '@/shared/lib/authToken';

// 화면에서 분기할 에러 종류. 예외 상황용 코드는 BE와 이름을 맞춰야 해요 (아직 가짜)
export type ApiErrorCode =
  | 'NETWORK_ERROR' // 서버에 닿지 못함 (오프라인, CORS, 주소 틀림)
  | 'PARSE_ERROR' // 응답이 JSON이 아님
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED' // 로그인이 필요하거나 토큰이 만료됨
  | 'INVALID_LOGIN' // 이메일 또는 비밀번호가 틀림
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN'
  | 'DUPLICATE_SOURCE' // 기능명세서 5-1 중복된 링크
  | 'DUPLICATE_PLACE' // 기능명세서 5-2 보관함에 이미 있는 장소
  | 'PLAN_PERIOD_OVERLAP' // 기능명세서 5-3 같은 기간에 다른 계획
  | 'AI_DRAFT_NO_PLACES'
  | 'AI_DRAFT_FAILED';

export class ApiError extends Error {
  /** HTTP 상태 코드. 서버에 닿지 못했으면 0 */
  readonly status: number;
  readonly code: ApiErrorCode;
  /** 서버가 함께 보낸 값 (예: 중복된 기존 항목 id) */
  readonly details?: unknown;

  constructor({ status, code, message, details }: {
    status: number;
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(error: unknown, code?: ApiErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

const ERROR_MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  NETWORK_ERROR: '인터넷 연결을 확인하고 다시 시도해 주세요.',
  NOT_FOUND: '찾을 수 없어요. 삭제됐을 수 있어요.',
  UNAUTHORIZED: '다시 로그인해 주세요.',
  SERVER_ERROR: '잠시 후 다시 시도해 주세요.',
  AI_DRAFT_NO_PLACES: '이 도시의 장소 카드를 보관함에 추가한 뒤 다시 시도해 주세요.',
  AI_DRAFT_FAILED: '초안을 만들지 못했어요. 기존 계획은 그대로예요. 다시 시도해 주세요.',
};

/** 화면에 보여줄 한 줄 안내 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return ERROR_MESSAGES[error.code] ?? error.message;
  return '문제가 생겼어요. 다시 시도해 주세요.';
}

type QueryValue = string | number | boolean | undefined;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** JSON으로 바꿔서 보냄 */
  body?: unknown;
  /** 값이 undefined인 항목은 빼고 붙임 */
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** false면 로그인 토큰을 붙이지 않아요 (로그인·회원가입·토큰 재발급) */
  isAuthRequired?: boolean;
};

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const search = params.toString();
  return `${API_BASE_URL}${path}${search ? `?${search}` : ''}`;
};

const DEFAULT_CODES: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

// 에러 응답은 { code, message, details? }. message는 화면에 바로 띄울 수 있는 문구예요 (BE 확인)
const toApiError = (status: number, body: unknown) => {
  const fields = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const code =
    typeof fields.code === 'string'
      ? (fields.code as ApiErrorCode)
      : (DEFAULT_CODES[status] ?? (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN'));
  const message = typeof fields.message === 'string' ? fields.message : `요청 실패 (${status})`;
  return new ApiError({ status, code, message, details: fields.details });
};

const parseJson = (text: string): { isOk: true; value: unknown } | { isOk: false } => {
  try {
    return { isOk: true, value: JSON.parse(text) };
  } catch {
    return { isOk: false };
  }
};

type TokenResponse = { accessToken: string; refreshToken: string };

let refreshing: Promise<boolean> | null = null;

/** 토큰 재발급. 동시에 여러 요청이 401을 받아도 한 번만 보내요 */
const refreshTokens = () => {
  refreshing ??= (async () => {
    const tokens = getAuthTokens();
    if (!tokens) return false;
    try {
      const next = await sendRequest<TokenResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: tokens.refreshToken },
        isAuthRequired: false,
      });
      setAuthTokens(next);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
};

async function sendRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, isAuthRequired = true } = options;
  const hasBody = body !== undefined;
  const accessToken = isAuthRequired ? getAuthTokens()?.accessToken : undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    // 화면을 떠나서 취소된 요청은 TanStack Query가 처리하도록 그대로 던짐
    if (signal?.aborted) throw error;
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: '서버에 연결하지 못했어요.' });
  }

  const text = await response.text();
  const parsed = text ? parseJson(text) : { isOk: true as const, value: undefined };

  if (!response.ok) throw toApiError(response.status, parsed.isOk ? parsed.value : undefined);
  if (!parsed.isOk) {
    throw new ApiError({ status: response.status, code: 'PARSE_ERROR', message: '응답을 읽지 못했어요.' });
  }
  return parsed.value as T;
}

/**
 * 모든 API 요청이 거치는 함수. 실패하면 항상 ApiError를 던져요.
 * 로그인 토큰을 붙이고, 만료돼 401이 오면 한 번 재발급받아 다시 보내요.
 * 재발급도 실패하면 토큰을 지우고 로그인 화면으로 보내요 (onAuthExpired).
 * 응답 모양은 검사하지 않고 T로 믿어요.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const sentToken = getAuthTokens()?.accessToken;
  try {
    return await sendRequest<T>(path, options);
  } catch (error) {
    const isExpired = isApiError(error) && error.status === 401 && options.isAuthRequired !== false;
    if (!isExpired) throw error;

    // 그사이 다른 요청이 토큰을 새로 받아 뒀으면 재발급 없이 다시 보내요
    const currentToken = getAuthTokens()?.accessToken;
    const canRetry = Boolean(currentToken) && (currentToken !== sentToken || (await refreshTokens()));
    if (!canRetry) {
      notifyAuthExpired();
      throw error;
    }
    try {
      return await sendRequest<T>(path, options);
    } catch (retryError) {
      if (isApiError(retryError) && retryError.status === 401) notifyAuthExpired();
      throw retryError;
    }
  }
}
