import { useState, type SyntheticEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import Button from '@/shared/components/Button';
import { getErrorMessage, isApiError } from '@/shared/api/client';
import { usePlaces } from '@/features/place/model/usePlaces';
import { fetchPlan } from '@/features/plan/api/plans';
import type { Plan } from '@/features/plan/model/plan.types';
import { completePlanDay } from '@/features/plan/model/planDays';
import { useCreatePlan, usePlan, useUpdatePlan, moveNodeInDay } from '@/features/plan/model/usePlan';
import styles from './LiveApiTestPanel.module.css';

const orderOf = (plan: Plan) => plan.days[0]?.nodes.map((node) => node.placeId).join(',') ?? '';

export default function LivePlanTestPanel() {
  const [params, setParams] = useSearchParams();
  const planId = params.get('planId') ?? '';
  const [existingId, setExistingId] = useState(planId);
  const [name, setName] = useState('API 저장 검증');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(['', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const create = useCreatePlan();
  const update = useUpdatePlan(planId);
  const { plan, error: planError, refetch } = usePlan(planId || undefined);
  const { places, viewStatus: placesStatus, refetch: refetchPlaces } = usePlaces();
  const candidates = places.filter((place) => place.location && place.category !== 'transportation' && place.category !== 'tip');
  const isBusy = isChecking || update.isSaving || create.isPending;

  const createTestPlan = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!name.trim() || !city.trim() || !date || isBusy) return;
    setError('');
    setMessage('');
    create.mutate({ title: name.trim(), destination: city.trim(), startDate: date, endDate: date }, {
      onSuccess: (created) => setParams((current) => {
        const next = new URLSearchParams(current);
        next.set('planId', created.id);
        return next;
      }, { replace: true }),
      onError: (error) => setError(getErrorMessage(error)),
    });
  };

  const saveTwoPlaces = async () => {
    if (!plan || !selectedIds[0] || !selectedIds[1] || selectedIds[0] === selectedIds[1] || isBusy) return;
    setIsChecking(true);
    setError('');
    setMessage('');
    try {
      const next: Plan = { ...plan, days: plan.days.map((day, index) => index === 0
        ? { ...day, zone: day.zone ?? plan.destination, zoneCenter: day.zoneCenter ?? places.find((place) => place.id === selectedIds[0])?.location,
          isCompleted: false, nodes: selectedIds.map((placeId) => ({ id: crypto.randomUUID(), placeId })) }
        : day) };
      await update.mutateAsync({ ...next, status: 'draft' });
      const actual = await fetchPlan(plan.id);
      if (orderOf(actual) !== selectedIds.join(',')) throw new Error('저장한 장소 순서와 조회 결과가 달라요.');
      setMessage(`1일차 저장·재조회 성공: ${orderOf(actual)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : getErrorMessage(error));
    } finally { setIsChecking(false); }
  };

  const checkConsecutiveSaves = async () => {
    if (!plan || (plan.days[0]?.nodes.length ?? 0) < 2 || isBusy) return;
    setIsChecking(true);
    setError('');
    setMessage('');
    try {
      const first = moveNodeInDay(plan, 0, 0, 1);
      // 원래 값으로 되돌리는 두 번째 요청도 생략되지 않아야 해요.
      const last = structuredClone(plan);
      const outcomes = await Promise.allSettled([update.mutateAsync(first), update.mutateAsync(last)]);
      const failed = outcomes.find((outcome) => outcome.status === 'rejected');
      if (failed?.status === 'rejected') throw failed.reason;
      const actual = await fetchPlan(plan.id);
      if (orderOf(actual) !== orderOf(last)) throw new Error('마지막 저장 요청의 순서가 남지 않았어요.');
      setMessage(`연속 저장·재조회 성공: 마지막 순서 ${orderOf(actual)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : getErrorMessage(error));
    } finally { setIsChecking(false); }
  };

  const checkRejectedSave = async () => {
    if (!plan || !plan.days[0]?.nodes[0] || isBusy) return;
    setIsChecking(true);
    setError('');
    setMessage('');
    const node = plan.days[0].nodes[0];
    const invalid: Plan = { ...plan, days: plan.days.map((day, index) => index === 0
      ? { ...day, nodes: [node, { ...node, id: crypto.randomUUID() }] } : day) };
    try {
      await update.mutateAsync(invalid);
      setError('중복 장소 저장이 거부되지 않았어요. 서버 규칙을 확인해야 해요.');
    } catch (error) {
      try {
        const actual = await fetchPlan(plan.id);
        if (isApiError(error, 'DUPLICATE_PLAN_PLACE') && orderOf(actual) === orderOf(plan)) {
          setMessage('저장 실패 검증 성공: 중복 장소를 거부했고 기존 순서는 유지됐어요.');
        } else {
          setError(`예상과 다른 실패예요. ${getErrorMessage(error)}`);
        }
      } catch (readError) { setError(getErrorMessage(readError)); }
    } finally { setIsChecking(false); }
  };

  const completeTestDay = async () => {
    if (!plan || isBusy) return;
    setIsChecking(true);
    setError('');
    setMessage('');
    try {
      await update.mutateAsync(completePlanDay(plan, 0));
      const actual = await fetchPlan(plan.id);
      if (!actual.days[0]?.isCompleted) throw new Error('완료 상태가 저장되지 않았어요.');
      setMessage(`일차 완료·재조회 성공: ${actual.status}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : getErrorMessage(error));
    } finally { setIsChecking(false); }
  };

  return (
    <section className={styles.step} aria-labelledby="live-plan-title">
      <h3 id="live-plan-title">여행계획 저장 검증</h3>
      <p>검증용 하루 계획을 만들어 순서 저장·연속 저장·저장 거부 후 복구를 확인해요.</p>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!/^[1-9]\d*$/.test(existingId) || isBusy) return;
        setError(''); setMessage('');
        setParams((current) => {
          const next = new URLSearchParams(current);
          next.set('planId', existingId);
          return next;
        }, { replace: true });
      }}>
        <label className={styles.field}>기존 검증 계획 ID<input inputMode="numeric" value={existingId} onChange={(event) => setExistingId(event.target.value)} disabled={isBusy} /></label>
        <Button type="submit" size="sm" variant="outline" disabled={isBusy || !/^[1-9]\d*$/.test(existingId)}>기존 계획 조회</Button>
      </form>
      <form onSubmit={createTestPlan}>
        <label className={styles.field}>검증 계획 이름<input value={name} maxLength={50} onChange={(event) => setName(event.target.value)} disabled={isBusy} /></label>
        <label className={styles.field}>검증 도시<input value={city} onChange={(event) => setCity(event.target.value)} disabled={isBusy} /></label>
        <label className={styles.field}>검증 날짜<input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={isBusy} /></label>
        <Button type="submit" size="sm" disabled={!name.trim() || !city.trim() || !date || isBusy}>검증용 계획 만들기</Button>
      </form>
      {planError && <p className={styles.error} role="alert">{getErrorMessage(planError)}</p>}
      {plan && <>
        <p>계획 {plan.id} · {plan.title} · {plan.status}</p>
        <p>1일차 장소 순서: {orderOf(plan) || '없음'}</p>
        <div className={styles.buttons}>
          <Link to={`/plans/${plan.id}`}>완성 보기</Link>
          <Link to={`/plans/${plan.id}/edit`}>편집 화면</Link>
          <Button size="sm" variant="outline" isFullWidth={false} disabled={isBusy} onClick={() => void refetch()}>계획 다시 조회</Button>
        </div>
        {placesStatus === 'error' && <Button size="sm" variant="outline" onClick={() => void refetchPlaces()}>보관함 다시 조회</Button>}
        {[0, 1].map((index) => <label className={styles.field} key={index}>{index + 1}번째 장소
          <select value={selectedIds[index]} disabled={isBusy} onChange={(event) => setSelectedIds((current) => current.map((id, i) => i === index ? event.target.value : id))}>
            <option value="">보관한 장소 선택</option>
            {candidates.map((place) => <option value={place.id} key={place.id}>{place.name}</option>)}
          </select>
        </label>)}
        <Button size="sm" disabled={isBusy || !selectedIds[0] || !selectedIds[1] || selectedIds[0] === selectedIds[1]} onClick={() => void saveTwoPlaces()}>1일차를 선택한 장소 2개로 저장</Button>
        <Button size="sm" disabled={isBusy || (plan.days[0]?.nodes.length ?? 0) < 2} onClick={() => void checkConsecutiveSaves()}>순서를 바꿨다가 되돌려 연속 저장</Button>
        <Button size="sm" variant="outline" disabled={isBusy || !plan.days[0]?.nodes.length} onClick={() => void checkRejectedSave()}>중복 장소로 저장 실패 확인</Button>
        <Button size="sm" disabled={isBusy || !plan.days[0]?.nodes.length} onClick={() => void completeTestDay()}>1일차 완료 저장</Button>
      </>}
      {isBusy && <p role="status">저장과 재조회를 확인하고 있어요.</p>}
      {message && <p className={styles.success} role="status">{message}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </section>
  );
}
