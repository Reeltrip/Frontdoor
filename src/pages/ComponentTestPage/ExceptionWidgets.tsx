// 기능명세서 5. 예외 상황 처리 사용 예 (가짜 응답). 실제 화면을 만들 때 이 파일을 참고해요.
// 가짜 저장소는 다른 데모와 같이 써서, 여기서 삭제·대체한 카드는 위 usePlaces 데모에도 반영돼요. 새로고침하면 처음으로 돌아가요.
import { useState } from 'react';
import Button from '@/shared/components/Button';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { getErrorMessage } from '@/shared/api/client';
import { EXCEPTION_MODALS } from '@/shared/lib/exceptionMessages';
import { FAKE_PARTIAL_KEYWORD, FAKE_SAME_PLACE_KEYWORD } from '@/features/place/api/places.fake';
import { useDeletePlace, usePlaces } from '@/features/place/model/usePlaces';
import type { Place } from '@/features/place/model/place.types';
import PlaceCard from '@/features/place/ui/PlaceCard';
import PlaceCardCompact from '@/features/place/ui/PlaceCardCompact';
import { useCollectSources, type LinkCollectResult } from '@/features/source/model/useCollectSources';
import { useDuplicatePlaces } from '@/features/source/model/useDuplicatePlaces';
import { useSourceStatus } from '@/features/source/model/useSourceStatus';
import type { Plan } from '@/features/plan/model/plan.types';
import { finishPlan, formatDayDate, setDayNodes } from '@/features/plan/model/planDays';
import { getOverlappingPlanTitles, isPlanPeriodOverlapError, useCreatePlan, usePlan, useUpdatePlan } from '@/features/plan/model/usePlan';
import { useChangePlanPeriod } from '@/features/plan/model/useChangePlanPeriod';
import { useDeletedPlaces } from '@/features/plan/model/useDeletedPlaces';
import KeepDaysModal from '@/features/plan/ui/KeepDaysModal';
import styles from './ServerStateWidgets.module.css';

const NOOP = () => {};

/** 안내 문구 4개를 한눈에 보는 용도 */
export function ExceptionModalPreview({ name }: { name: keyof typeof EXCEPTION_MODALS }) {
  return <ConfirmModal isOpen isInline {...EXCEPTION_MODALS[name]} onCancel={NOOP} onConfirm={NOOP} />;
}

// ─── 5-1 링크 수집 · 5-2 보관함에 이미 있는 장소 · 삭제한 카드 다시 만들기 ───

const LINK_PRESETS = {
  normal: 'https://www.instagram.com/reel/fake-demo-a',
  fail: 'https://www.youtube.com/watch?v=fake-fail',
  samePlace: `https://blog.naver.com/fake-${FAKE_SAME_PLACE_KEYWORD}`,
  partial: `https://www.instagram.com/reel/fake-${FAKE_PARTIAL_KEYWORD}`,
};

const RESULT_LABELS: Record<LinkCollectResult['status'], string> = {
  collecting: '등록 중',
  duplicate: '중복 · 답 기다림',
  skipped: '중복 · 건너뜀',
  success: '등록됨',
  failed: '등록 실패',
};

export function CollectLinksDemo() {
  const collector = useCollectSources();

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <Button
          size="sm"
          isFullWidth={false}
          disabled={collector.isCollecting}
          onClick={() => collector.collect([LINK_PRESETS.normal, LINK_PRESETS.fail, LINK_PRESETS.samePlace])}
        >
          링크 3개 동시 수집
        </Button>
        <Button
          size="sm"
          variant="outline"
          isFullWidth={false}
          disabled={collector.isCollecting}
          onClick={() => collector.collect([LINK_PRESETS.partial])}
        >
          일부 추출 실패 링크
        </Button>
      </div>
      <p className={styles.hint}>
        3개 = 정상 · 분석 실패 · 보관함에 이미 있는 장소. 한 번 더 누르면 중복 링크 안내창이 링크마다 차례로 떠요.
        카드를 삭제한 링크는 다시 넣어도 중복으로 묻지 않고 새 카드를 만들어요.
      </p>

      <ul className={styles.list}>
        {collector.results.map((result) => (
          <LinkResultRow key={result.url} result={result} onRetry={() => collector.recollect(result.url)} />
        ))}
      </ul>
      {collector.results.length > 0 && !collector.isCollecting && !collector.duplicateUrl && !collector.hasCollected && (
        <p className={styles.hint}>새로 수집한 링크가 없어요. 링크 입력 화면에 그대로 있어요.</p>
      )}

      <ConfirmModal
        isOpen={collector.duplicateUrl !== undefined}
        {...EXCEPTION_MODALS.duplicateSource}
        description={collector.duplicateUrl}
        onCancel={collector.skipDuplicate}
        onConfirm={collector.recollectDuplicate}
      />
    </div>
  );
}

function LinkResultRow({ result, onRetry }: { result: LinkCollectResult; onRetry: () => void }) {
  return (
    <li className={styles.item}>
      <span className={styles.status}>
        {result.url.replace(/^https:\/\/(www\.)?/, '')}
        <br />
        <strong>{RESULT_LABELS[result.status]}</strong>
        {result.status === 'failed' && ` · ${getErrorMessage(result.error)}`}
        {result.status === 'success' && <SourceProgress sourceId={result.source.id} />}
      </span>
      {result.status === 'failed' && (
        <Button size="sm" variant="outline" isFullWidth={false} onClick={onRetry}>
          다시
        </Button>
      )}
    </li>
  );
}

function SourceProgress({ sourceId }: { sourceId: string }) {
  const { source, analysisStatus, refetch: refetchSource } = useSourceStatus(sourceId);
  const { places } = usePlaces();
  const deletePlace = useDeletePlace();
  const duplicates = useDuplicatePlaces(source);

  if (!source) return null;

  // 서버는 삭제된 카드를 빼고 placeIds를 줘요. 이름은 보관함 목록을 다시 받기 전이면 id로 보여줌
  const getPlaceName = (id: string) => places.find((place) => place.id === id)?.name ?? id;

  return (
    <>
      {analysisStatus === 'analyzing' && ` · 분석 중 ${source.step}/${source.totalSteps}`}
      {/* 가정: 전부 실패하면 기존 실패 화면(재시도·직접 입력)을 보여줘요 */}
      {analysisStatus === 'failed' && ` · 분석 실패 (${source.failReason ?? '-'}) → 실패 화면`}
      {analysisStatus === 'done' && source.placeIds.length === 0 && ' · 카드 없음 (삭제됨)'}
      {source.placeIds.map((placeId) => (
        <span key={placeId} className={styles.row}>
          <span>카드: {getPlaceName(placeId)}</span>
          <button
            type="button"
            className={styles.textButton}
            disabled={deletePlace.isPending}
            onClick={() => deletePlace.mutate(placeId, { onSuccess: () => refetchSource() })}
          >
            카드 삭제
          </button>
        </span>
      ))}
      {duplicates.error !== null && ` · ${getErrorMessage(duplicates.error)}`}

      <ConfirmModal
        isOpen={duplicates.duplicate !== undefined}
        {...EXCEPTION_MODALS.duplicatePlace}
        description={duplicates.existingPlace?.name}
        // '아니요'는 새 카드를 지우니까 바깥을 눌러 실수로 고르지 않게 함
        isDismissible={false}
        onCancel={duplicates.discardNew}
        onConfirm={duplicates.replaceWithNew}
      />
    </>
  );
}

// ─── 5-2 모든 항목 추출 실패 ───

const EMPTY_PLACE: Place = {
  id: 'demo-empty',
  category: 'food',
  name: '',
  imageUrl: '',
  summary: [],
};

export function EmptyFieldsCard({ isCompact = false }: { isCompact?: boolean }) {
  return isCompact ? <PlaceCardCompact place={EMPTY_PLACE} /> : <PlaceCard place={EMPTY_PLACE} />;
}

// ─── 5-3 계획 생성 ───

const PERIOD_PRESETS = [
  { label: '11.21~11.22 (겹침)', startDate: '2026-11-21', endDate: '2026-11-22' },
  { label: '1.5~1.7 (안 겹침)', startDate: '2027-01-05', endDate: '2027-01-07' },
];

function PlanDays({ plan }: { plan: Plan }) {
  const { places } = usePlaces();
  const getName = (placeId: string) => places.find((place) => place.id === placeId)?.name ?? `삭제됨 (${placeId})`;

  return (
    <>
      <p className={styles.status}>
        {plan.title} · {plan.startDate} ~ {plan.endDate} · <strong>{plan.status === 'draft' ? '작성 중' : '완성'}</strong>
      </p>
      <ul className={styles.list}>
        {plan.days.map((day, index) => (
          <li key={day.date} className={styles.item}>
            <span>
              {index + 1}일차 · {formatDayDate(day.date)}
              {day.zone && ` · ${day.zone}`}
            </span>
            <span className={styles.hint}>
              {day.nodes.length === 0
                ? '비어 있음'
                : day.nodes
                    .map((node) => getName(node.placeId) + (node.planB ? ` (플랜B: ${getName(node.planB.placeId)})` : ''))
                    .join(' → ')}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function CreatePlanDemo() {
  const createPlan = useCreatePlan();
  const [planId, setPlanId] = useState<string>();
  const [overlapError, setOverlapError] = useState<{ error: unknown; request: (typeof PERIOD_PRESETS)[number] }>();
  const { plan } = usePlan(planId);
  const updatePlan = useUpdatePlan(planId ?? '');
  const { places } = usePlaces();

  const submit = (preset: (typeof PERIOD_PRESETS)[number], isForced = false) => {
    createPlan.mutate(
      { title: `새 여행 ${preset.label}`, startDate: preset.startDate, endDate: preset.endDate, isForced },
      {
        onSuccess: (created) => setPlanId(created.id),
        onError: (error) => {
          if (isPlanPeriodOverlapError(error)) setOverlapError({ error, request: preset });
        },
      },
    );
  };

  // 1일차만 카드를 고르고 나머지는 카드 0개로 건너뜀
  const finishWithSkippedDays = () => {
    if (!plan || places.length === 0) return;
    const picked = plan.days.reduce(
      (current, _day, index) =>
        setDayNodes(current, index, index === 0 ? [{ id: `demo-node-${Date.now()}`, placeId: places[0].id }] : []),
      plan,
    );
    updatePlan.mutate(finishPlan(picked));
  };

  const finishWithAllDays = () => {
    if (!plan || places.length === 0) return;
    const filled = plan.days.reduce(
      (current, _day, index) =>
        setDayNodes(current, index, [{ id: `demo-node-${Date.now()}-${index}`, placeId: places[index % places.length].id }]),
      plan,
    );
    updatePlan.mutate(finishPlan(filled));
  };

  const overlappingTitles = overlapError ? getOverlappingPlanTitles(overlapError.error) : [];

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        {PERIOD_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="sm"
            variant="outline"
            isFullWidth={false}
            disabled={createPlan.isPending}
            onClick={() => submit(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <p className={styles.hint}>새 계획은 날짜만 있는 빈 일차로 만들어지고 &apos;작성 중&apos;이에요.</p>
      {createPlan.isPending && <p className={styles.status}>만드는 중…</p>}
      {createPlan.isError && !isPlanPeriodOverlapError(createPlan.error) && (
        <p className={styles.status}>실패 · {getErrorMessage(createPlan.error)}</p>
      )}

      {plan && (
        <>
          <PlanDays plan={plan} />
          <div className={styles.row}>
            <Button size="sm" isFullWidth={false} disabled={updatePlan.isPending} onClick={finishWithSkippedDays}>
              1일차만 고르고 마치기
            </Button>
            <Button size="sm" variant="outline" isFullWidth={false} disabled={updatePlan.isPending} onClick={finishWithAllDays}>
              모든 일차 고르고 마치기
            </Button>
          </div>
          <p className={styles.hint}>건너뛴 일차가 하나라도 있으면 다른 일차가 완성돼도 &apos;작성 중&apos;이에요.</p>
        </>
      )}

      <ConfirmModal
        isOpen={overlapError !== undefined}
        {...EXCEPTION_MODALS.planPeriodOverlap}
        description={overlappingTitles.length > 0 ? `겹치는 계획: ${overlappingTitles.join(', ')}` : undefined}
        onCancel={() => setOverlapError(undefined)}
        onConfirm={() => {
          if (overlapError) submit(overlapError.request, true);
          setOverlapError(undefined);
        }}
      />
    </div>
  );
}

// ─── 5-3 계획에 넣은 카드를 삭제한 경우 ───

const DELETED_DEMO_PLAN_ID = 'fake-plan-1';

export function DeletedPlaceInPlanDemo() {
  const [isInPlan, setIsInPlan] = useState(false);
  const { plan } = usePlan(DELETED_DEMO_PLAN_ID);
  const { places } = usePlaces();
  const deletePlace = useDeletePlace();

  const planPlaceIds = new Set(
    plan?.days.flatMap((day) => day.nodes.flatMap((node) => (node.planB ? [node.placeId, node.planB.placeId] : [node.placeId]))),
  );
  const deletablePlaces = places.filter((place) => planPlaceIds.has(place.id));

  return (
    <div className={styles.box}>
      <p className={styles.hint}>1) 계획에서 나온 상태로 카드를 삭제하고 2) 계획에 다시 들어오면 안내창이 떠요.</p>
      <div className={styles.row}>
        {deletablePlaces.map((place) => (
          <Button
            key={place.id}
            size="sm"
            variant="outline"
            isFullWidth={false}
            disabled={isInPlan || deletePlace.isPending}
            onClick={() => deletePlace.mutate(place.id)}
          >
            {place.name.slice(0, 8)} 삭제
          </Button>
        ))}
      </div>
      <Button size="sm" isFullWidth={false} onClick={() => setIsInPlan(!isInPlan)}>
        {isInPlan ? '계획에서 나가기' : '계획에 들어가기'}
      </Button>
      {isInPlan && <PlanWithDeletedCheck />}
    </div>
  );
}

function PlanWithDeletedCheck() {
  const { plan } = usePlan(DELETED_DEMO_PLAN_ID);
  const deleted = useDeletedPlaces(DELETED_DEMO_PLAN_ID);

  return (
    <>
      {plan && <PlanDays plan={plan} />}
      {deleted.isResolving && <p className={styles.status}>처리 중…</p>}
      {deleted.error !== null && <p className={styles.status}>실패 · {getErrorMessage(deleted.error)}</p>}
      <ConfirmModal
        isOpen={deleted.hasDeletedPlaces}
        {...EXCEPTION_MODALS.deletedPlaceInPlan}
        description={`삭제된 카드 ${deleted.deletedPlaceIds.length}개`}
        // 두 답 모두 데이터를 바꿔서, 바깥을 눌러 닫으면 계획이 어중간하게 남음
        isDismissible={false}
        onCancel={deleted.restoreDeletedPlaces}
        onConfirm={deleted.removeDeletedNodes}
      />
    </>
  );
}

// ─── 5-4 기간 변경 ───

const PERIOD_DEMO_PLAN_ID = 'fake-plan-3days';

const PERIOD_CHANGES = [
  { label: '2일로 줄이기', startDate: '2026-12-10', endDate: '2026-12-11' },
  { label: '1일로 줄이기', startDate: '2026-12-10', endDate: '2026-12-10' },
  { label: '5일로 늘리기', startDate: '2026-12-10', endDate: '2026-12-14' },
];

export function ChangePeriodDemo() {
  const { plan } = usePlan(PERIOD_DEMO_PLAN_ID);
  const period = useChangePlanPeriod(plan);

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        {PERIOD_CHANGES.map((change) => (
          <Button
            key={change.label}
            size="sm"
            variant="outline"
            isFullWidth={false}
            disabled={!plan || period.isSaving}
            onClick={() => period.requestChange(change.startDate, change.endDate)}
          >
            {change.label}
          </Button>
        ))}
      </div>
      <p className={styles.hint}>줄이면 남길 일차를 고르고, 늘리면 빈 일차가 붙고 &apos;작성 중&apos;이 돼요. 새로고침하면 3일로 돌아가요.</p>
      {period.error !== null && <p className={styles.status}>저장 실패 · {getErrorMessage(period.error)}</p>}
      {plan && <PlanDays plan={plan} />}

      {plan && (
        <KeepDaysModal
          isOpen={period.keepCount !== undefined}
          days={plan.days}
          keepCount={period.keepCount ?? 0}
          onCancel={period.cancelChange}
          onConfirm={period.confirmKeptDays}
        />
      )}
    </div>
  );
}

const PREVIEW_DAYS: Plan['days'] = [
  { date: '2026-12-10', zone: '하카타', nodes: [{ id: 'a', placeId: 'p1' }, { id: 'b', placeId: 'p2' }] },
  { date: '2026-12-11', zone: '텐진', nodes: [{ id: 'c', placeId: 'p3' }] },
  { date: '2026-12-12', nodes: [] },
];

export function KeepDaysPreview() {
  return <KeepDaysModal isOpen isInline days={PREVIEW_DAYS} keepCount={2} onCancel={NOOP} onConfirm={NOOP} />;
}
