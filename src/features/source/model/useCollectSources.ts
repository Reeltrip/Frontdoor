import { useState } from 'react';
import type { CreateSourceRequest, Source } from './sourceStatus.types';
import { isDuplicateSourceError, useCreateSource } from './useSourceStatus';

/** 링크 하나의 수집 결과 (기능명세서 5-1 여러 링크 동시 수집: 결과를 링크별로 따로 가져요) */
export type LinkCollectResult =
  /** collecting: 등록 요청 중 / duplicate: 이전에 수집한 링크라 답을 기다림 / skipped: 중복 안내에서 '아니요' */
  | { url: string; status: 'collecting' | 'duplicate' | 'skipped' }
  /** 등록 성공. 분석 진행은 source.id로 useSourceStatus가 따로 불러와요 */
  | { url: string; status: 'success'; source: Source }
  | { url: string; status: 'failed'; error: unknown };

/** 앞뒤 공백과 빈 줄, 같은 입력 안에서 겹친 링크를 정리해요 */
export function normalizeLinks(links: string[]): string[] {
  return [...new Set(links.map((link) => link.trim()).filter(Boolean))];
}

/**
 * 링크마다 따로 등록을 요청하고 결과를 링크별로 돌려줘요.
 * 하나가 실패하거나 중복이어도 나머지 링크는 그대로 진행돼요.
 */
export async function requestLinks(
  urls: string[],
  createSource: (request: CreateSourceRequest) => Promise<Source>,
  isForced = false,
): Promise<LinkCollectResult[]> {
  const outcomes = await Promise.allSettled(urls.map((url) => createSource({ url, isForced })));

  return outcomes.map((outcome, index): LinkCollectResult => {
    const url = urls[index];
    if (outcome.status === 'fulfilled') return { url, status: 'success', source: outcome.value };
    if (isDuplicateSourceError(outcome.reason)) return { url, status: 'duplicate' };
    return { url, status: 'failed', error: outcome.reason };
  });
}

/**
 * 링크 수집 흐름 (기능명세서 5-1).
 * - collect(링크들): 링크마다 따로 요청해요
 * - duplicateUrl이 있으면 EXCEPTION_MODALS.duplicateSource 안내창을 띄워요.
 *   '네'는 recollectDuplicate, '아니요'는 skipDuplicate예요. 중복이 여러 개면 하나씩 차례로 물어요
 * - '아니요' 뒤에 성공한 링크가 하나도 없으면(hasCollected가 false) 링크 입력 화면에 그대로 있으면 돼요
 */
export function useCollectSources() {
  const { mutateAsync: createSource } = useCreateSource();
  const [results, setResults] = useState<LinkCollectResult[]>([]);

  const replaceResult = (next: LinkCollectResult) =>
    setResults((current) => current.map((result) => (result.url === next.url ? next : result)));

  const collect = async (links: string[]) => {
    const urls = normalizeLinks(links);
    setResults(urls.map((url) => ({ url, status: 'collecting' })));
    const nextResults = await requestLinks(urls, createSource);
    setResults(nextResults);
    return nextResults;
  };

  /** 링크 하나만 다시 요청 (중복 안내에서 '네', 실패한 링크 재시도) */
  const recollect = async (url: string, isForced = false) => {
    replaceResult({ url, status: 'collecting' });
    const [nextResult] = await requestLinks([url], createSource, isForced);
    replaceResult(nextResult);
    return nextResult;
  };

  const duplicateUrl = results.find((result) => result.status === 'duplicate')?.url;

  return {
    results,
    collect,
    recollect,
    /** 지금 물어볼 중복 링크. 없으면 undefined */
    duplicateUrl,
    recollectDuplicate: () => (duplicateUrl ? recollect(duplicateUrl, true) : undefined),
    skipDuplicate: () => {
      if (duplicateUrl) replaceResult({ url: duplicateUrl, status: 'skipped' });
    },
    isCollecting: results.some((result) => result.status === 'collecting'),
    hasCollected: results.some((result) => result.status === 'success'),
    reset: () => setResults([]),
  };
}
