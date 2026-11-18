import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import searchIcon from '@/shared/assets/icons/search.svg';
import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import { placeKeys, searchPlaces, type PlaceSearchResult } from '@/features/place/api/places';
import type { PlanZone } from '../lib/planZones';
import styles from './ZoneSheet.module.css';

type ZoneSheetProps = {
  /** '1일차 · 11.14 (토)' */
  dayLabel: string;
  /** 여행 장소(예: 오사카). 검색어 앞에 붙여 그 도시 안에서 찾아요 */
  destination?: string;
  selectedZone: PlanZone | undefined;
  onSelectZone: (zone: PlanZone & { result: PlaceSearchResult }) => void;
  onEditQuery?: () => void;
  isLodging?: boolean;
};

// 여행 구역 선택(기능명세서 4-3) 아래쪽 시트. 구역 이름을 검색해 골라요
export default function ZoneSheet({ dayLabel, destination, selectedZone, onSelectZone, onEditQuery, isLodging = false }: ZoneSheetProps) {
  const [query, setQuery] = useState(selectedZone?.name ?? '');
  /** 검색 버튼·Enter로 확정한 검색어. 글자를 칠 때마다 서버를 부르지 않아요 */
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isListOpen, setIsListOpen] = useState(false);
  const listId = useId();

  const search = useQuery({
    queryKey: placeKeys.search(`${destination ?? ''} ${submittedQuery}`.trim()),
    queryFn: ({ signal }) => searchPlaces(`${destination ?? ''} ${submittedQuery}`.trim(), signal),
    enabled: submittedQuery !== '',
    staleTime: Infinity,
  });
  const results = (search.data ?? []).slice(0, 5).map((place) => ({
    name: place.name,
    result: place,
    center: { lat: place.latitude, lng: place.longitude },
  }));
  const hasHangul = (text: string) => /[가-힣]/.test(text);

  const submit = () => {
    const keyword = query.trim();
    if (!keyword) return;
    if (keyword === submittedQuery && search.isError) void search.refetch();
    setSubmittedQuery(keyword);
    setIsListOpen(true);
  };

  const chooseZone = (zone: PlanZone & { result: PlaceSearchResult }) => {
    // 한글로 검색했는데 결과 이름이 영어(Namba)면 검색한 이름(난바)으로 보여줘요
    const name = !isLodging && !hasHangul(zone.name) && hasHangul(submittedQuery) ? submittedQuery : zone.name;
    setQuery(name);
    setIsListOpen(false);
    onSelectZone({ ...zone, name });
  };

  const renderStatus = () => {
    if (submittedQuery === '') return null;
    if (search.isPending) return '찾는 중이에요.';
    if (search.isError) return '검색 결과를 불러오지 못했어요. 다시 시도해 주세요.';
    if (results.length === 0) return '검색 결과가 없어요.';
    return null;
  };
  const statusText = renderStatus();

  return (
    <section className={styles.sheet} aria-label={isLodging ? '숙소 직접 추가' : '여행 구역 선택'}>
      <img src={handleIcon} alt="" className={styles.handle} />
      <h2 className={styles.title}>{isLodging ? dayLabel : `${dayLabel} 어디를 둘러볼까요?`}</h2>

      <div className={styles.field}>
        <input
          type="search"
          className={styles.input}
          placeholder={isLodging ? '숙소를 검색해주세요.' : '장소를 검색해주세요.'}
          value={query}
          aria-label={isLodging ? '숙소 검색어' : '여행 구역 검색'}
          aria-controls={listId}
          aria-expanded={isListOpen}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsListOpen(false);
            onEditQuery?.();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
        <button type="button" className={styles.searchButton} aria-label={isLodging ? '숙소 검색' : '구역 검색'} onClick={submit}>
          <img src={searchIcon} alt="" className={styles.searchIcon} />
        </button>
      </div>

      {isListOpen && (
        <ul id={listId} className={styles.results} role="listbox">
          {statusText && <li className={styles.empty}>{statusText}</li>}
          {!statusText &&
            results.map((zone) => (
              <li key={`${zone.name}-${zone.center.lat}-${zone.center.lng}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={zone.name === selectedZone?.name}
                  className={styles.result}
                  onClick={() => chooseZone(zone)}
                >
                  {zone.name}
                  {isLodging && zone.result.address && <small>{zone.result.address}</small>}
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
