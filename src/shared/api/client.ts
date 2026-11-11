import { API_BASE_URL } from '@/shared/lib/env';

// 화면에서 분기할 에러 종류. 예외 상황용 코드는 BE와 이름을 맞춰야 해요 (아직 가짜)
export type ApiErrorCode =
  | 'NETWORK_ERROR' // 서버에 닿지 못함 (오프라인, CORS, 주소 틀림)
  | 'PARSE_ERROR' // 응답이 JSON이 아님
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'UNKNOWN'
  | 'DUPLICATE_SOURCE' // 기능명세서 5-1 중복된 링크
  | 'DUPLICATE_PLACE' // 기능명세서 5-2 보관함에 이미 있는 장소
  | 'PLAN_PERIOD_OVERLAP'; // 기능명세서 5-3 같은 기간에 다른 계획

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
  SERVER_ERROR: '잠시 후 다시 시도해 주세요.',
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
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

// 가짜 형식: 에러 응답은 { code, message, details }로 가정. BE와 정해지면 맞추기
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

/**
 * 모든 API 요청이 거치는 함수. 실패하면 항상 ApiError를 던져요.
 * 응답 모양은 검사하지 않고 T로 믿어요 (BE 형식 확정 후 필요하면 검사 추가).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options;
  const hasBody = body !== undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: hasBody
        ? { Accept: 'application/json', 'Content-Type': 'application/json' }
        : { Accept: 'application/json' },
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
