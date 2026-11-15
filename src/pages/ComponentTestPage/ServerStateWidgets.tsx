// 서버 상태 훅 사용 예 (가짜 응답). 실제 화면을 만들 때 이 파일을 참고해요
import { useState } from 'react';
import Button from '@/shared/components/Button';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { getErrorMessage } from '@/shared/api/client';
import type { ViewStatus } from '@/shared/api/viewStatus';
import { isFakeApiEnabled } from '@/shared/lib/env';
import { CATEGORIES } from '@/features/place/lib/categories';
import type { PlaceCategory } from '@/features/place/model/place.types';
import { usePlaces, useUpdatePlace } from '@/features/place/model/usePlaces';
import { isDuplicateSourceError, useCreateSource, useSourceStatus } from '@/features/source/model/useSourceStatus';
import { failNextFakePlanSave } from '@/features/plan/api/plans.fake';
import { moveNodeInDay, usePlan, useUpdatePlan } from '@/features/plan/model/usePlan';
import styles from './ServerStateWidgets.module.css';

const VIEW_STATUS_LABELS: Record<ViewStatus, string> = {
  loading: '로딩',
  error: '실패',
  empty: '빈 화면',
  success: '성공',
};

function StatusLine({ viewStatus, error }: { viewStatus: ViewStatus; error?: unknown }) {
  return (
    <p className={styles.status}>
      viewStatus: <strong>{VIEW_STATUS_LABELS[viewStatus]}</strong>
      {viewStatus === 'error' && ` · ${getErrorMessage(error)}`}
    </p>
  );
}

export function ApiModeNote() {
  return (
    <p className={styles.note}>
      {isFakeApiEnabled
        ? '지금은 가짜 응답이에요. .env에 VITE_USE_FAKE_API=false를 넣으면 VITE_API_BASE_URL로 요청해요.'
        : '실제 서버로 요청하고 있어요.'}
    </p>
  );
}

const DEMO_LINK = 'https://www.instagram.com/reel/fake-demo';
const DEMO_FAIL_LINK = 'https://www.instagram.com/reel/fake-fail';

export function SourceStatusDemo() {
  const [sourceId, setSourceId] = useState<string>();
  const [duplicateUrl, setDuplicateUrl] = useState<string>();
  const createSource = useCreateSource();
  const { source, analysisStatus, viewStatus, error } = useSourceStatus(sourceId);

  const submitLink = (url: string, isForced = false) => {
    createSource.mutate(
      { url, isForced },
      {
        onSuccess: (created) => setSourceId(created.id),
        onError: (mutationError) => {
          if (isDuplicateSourceError(mutationError)) setDuplicateUrl(url);
        },
      },
    );
  };

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Button size="sm" isFullWidth={false} onClick={() => submitLink(DEMO_LINK)} disabled={createSource.isPending}>
          링크 등록
        </Button>
        <Button size="sm" variant="outline" isFullWidth={false} onClick={() => submitLink(DEMO_FAIL_LINK)}>
          실패하는 링크
        </Button>
      </div>
      <p className={styles.hint}>같은 링크를 두 번 누르면 중복 링크 모달이 떠요.</p>

      {createSource.isPending && <p className={styles.status}>등록 중…</p>}
      {createSource.isError && !isDuplicateSourceError(createSource.error) && (
        <p className={styles.status}>등록 실패 · {getErrorMessage(createSource.error)}</p>
      )}

      {sourceId && (
        <>
          <StatusLine viewStatus={viewStatus} error={error} />
          {source && (
            <p className={styles.status}>
              {source.id} · {analysisStatus} · 단계 {source.step}/{source.totalSteps}
              {source.placeIds.length > 0 && ` · 카드 ${source.placeIds.join(', ')}`}
              {source.failReason && ` · ${source.failReason}`}
            </p>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={duplicateUrl !== undefined}
        isInline
        icon="link"
        title="이전에 수집한 적 있는 링크예요. 다시 수집할까요?"
        cancelLabel="아니요"
        confirmLabel="네"
        onCancel={() => setDuplicateUrl(undefined)}
        onConfirm={() => {
          if (duplicateUrl) submitLink(duplicateUrl, true);
          setDuplicateUrl(undefined);
        }}
      />
    </div>
  );
}

const CATEGORY_FILTERS: (PlaceCategory | undefined)[] = [undefined, 'food', 'accommodation', 'cafe', 'shopping'];

export function PlacesDemo() {
  const [category, setCategory] = useState<PlaceCategory>();
  const { places, viewStatus, error, isRefetching } = usePlaces({ category });
  const updatePlace = useUpdatePlace();

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        {CATEGORY_FILTERS.map((item) => (
          <Button
            key={item ?? 'all'}
            size="sm"
            variant={item === category ? 'filled' : 'outline'}
            isFullWidth={false}
            onClick={() => setCategory(item)}
          >
            {item ? CATEGORIES[item].label : '전체'}
          </Button>
        ))}
      </div>
      <StatusLine viewStatus={viewStatus} error={error} />
      {isRefetching && <p className={styles.hint}>다시 불러오는 중…</p>}
      {viewStatus === 'empty' && <p className={styles.hint}>이 카테고리에는 카드가 없어요.</p>}
      <ul className={styles.list}>
        {places.map((place) => (
          <li key={place.id} className={styles.item}>
            <span>{place.name}</span>
            <Button
              size="sm"
              variant="outline"
              isFullWidth={false}
              disabled={updatePlace.isPending}
              onClick={() => updatePlace.mutate({ id: place.id, changes: { name: `${place.name} ✓` } })}
            >
              이름 수정
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlanDemo({ planId }: { planId: string }) {
  const { plan, viewStatus, error } = usePlan(planId);
  const { places } = usePlaces();
  const updatePlan = useUpdatePlan(planId);

  const getPlaceName = (placeId: string) => places.find((place) => place.id === placeId)?.name ?? placeId;

  const moveNode = (dayIndex: number, fromIndex: number, toIndex: number) => {
    if (plan) updatePlan.mutate(moveNodeInDay(plan, dayIndex, fromIndex, toIndex));
  };

  return (
    <div className={styles.box}>
      <StatusLine viewStatus={viewStatus} error={error} />
      {plan && (
        <>
          <p className={styles.status}>
            {plan.title} · {plan.startDate} ~ {plan.endDate}
            {plan.status === 'draft' && ' · 작성 중'}
          </p>
          {viewStatus === 'success' && (
            <Button size="sm" variant="outline" isFullWidth={false} onClick={failNextFakePlanSave}>
              다음 저장 한 번 실패시키기
            </Button>
          )}
          {updatePlan.isError && <p className={styles.status}>저장 실패 · 순서를 되돌렸어요</p>}
          {plan.days.map((day, dayIndex) => (
            <div key={day.date}>
              <p className={styles.status}>
                {dayIndex + 1}일차 · {day.date}
                {day.zone && ` · ${day.zone}`}
                {day.nodes.length === 0 && ' · 비어 있음'}
              </p>
              <ol className={styles.list}>
                {day.nodes.map((node, nodeIndex) => (
                  <li key={node.id} className={styles.item}>
                    <span>
                      {getPlaceName(node.placeId)}
                      {node.planB && ` (플랜B: ${getPlaceName(node.planB.placeId)})`}
                    </span>
                    <span className={styles.row}>
                      <Button
                        size="sm"
                        variant="outline"
                        isFullWidth={false}
                        aria-label="위로"
                        disabled={nodeIndex === 0}
                        onClick={() => moveNode(dayIndex, nodeIndex, nodeIndex - 1)}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isFullWidth={false}
                        aria-label="아래로"
                        disabled={nodeIndex === day.nodes.length - 1}
                        onClick={() => moveNode(dayIndex, nodeIndex, nodeIndex + 1)}
                      >
                        ↓
                      </Button>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
