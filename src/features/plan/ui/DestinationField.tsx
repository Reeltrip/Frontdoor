import { useEffect, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import locationIcon from '@/shared/assets/icons/location-light.svg';
import LabeledInput from '@/shared/components/LabeledInput';
import { placeKeys, searchPlaces } from '@/features/place/api/places';
import styles from './DestinationField.module.css';

type DestinationFieldProps = {
  /** 입력칸에 보이는 글자 */
  value: string;
  /** 검색 결과에서 골라 확정했는지. 확정 전에는 아래에 검색 결과를 보여줘요 */
  isConfirmed: boolean;
  onType: (text: string) => void;
  /** searchedQuery: 결과를 찾을 때 쓴 검색어, resultName: 고른 장소 이름 */
  onChoose: (searchedQuery: string, resultName: string) => void;
};

/** 글자를 멈추고 이만큼 지나면 검색해요. 칠 때마다 서버를 부르지 않아요 */
const SEARCH_DELAY_MS = 400;
const MAX_RESULTS = 4;

// 여행주소 입력칸 (기능명세서 4-1). 아무 글자나 넣지 못하게 장소 검색 결과에서 골라야 확정돼요
export default function DestinationField({ value, isConfirmed, onType, onChoose }: DestinationFieldProps) {
  const keyword = value.trim();
  const [searchedQuery, setSearchedQuery] = useState('');
  const listId = useId();

  useEffect(() => {
    if (isConfirmed || keyword === '') return undefined;
    const timer = window.setTimeout(() => setSearchedQuery(keyword), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword, isConfirmed]);

  const isListOpen = !isConfirmed && keyword !== '';
  // 글자를 고친 직후에는 예전 검색어의 결과를 보여주지 않아요
  const isWaiting = searchedQuery !== keyword;
  const search = useQuery({
    queryKey: placeKeys.search(searchedQuery),
    queryFn: ({ signal }) => searchPlaces(searchedQuery, signal),
    enabled: isListOpen && !isWaiting,
    staleTime: Infinity,
  });
  const results = (search.data ?? []).slice(0, MAX_RESULTS);

  const getStatusText = () => {
    if (isWaiting || search.isPending) return '찾는 중이에요.';
    if (search.isError) return '장소를 찾지 못했어요. 다시 시도해 주세요.';
    if (results.length === 0) return '찾는 장소가 없어요. 다른 이름으로 검색해 주세요.';
    return null;
  };
  const statusText = isListOpen ? getStatusText() : null;

  return (
    <div className={styles.field}>
      <LabeledInput
        label="여행주소"
        value={value}
        onChange={onType}
        placeholder="주소 검색하기"
        maxLength={50}
        autoComplete="off"
        role="combobox"
        aria-controls={listId}
        aria-expanded={isListOpen}
        // 확정 전에 Enter를 눌러도 폼이 제출되지 않게 해요 (목록에서 골라야 해요)
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !isConfirmed) event.preventDefault();
        }}
      />
      <span className={styles.icon}>
        <img src={locationIcon} alt="" />
      </span>

      {isListOpen && (
        <ul id={listId} className={styles.results} role="listbox" aria-label="여행주소 검색 결과">
          {statusText ? (
            <li className={styles.status} role={search.isError ? 'alert' : 'status'}>
              {statusText}
              {search.isError && (
                <button type="button" className={styles.retry} onClick={() => search.refetch()}>
                  다시 시도
                </button>
              )}
            </li>
          ) : (
            <>
              <li className={styles.guide}>목록에서 여행지를 골라 주세요.</li>
              {results.map((place) => (
                <li key={place.googlePlaceId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    className={styles.result}
                    onClick={() => onChoose(searchedQuery, place.name)}
                  >
                    <span className={styles.name}>{place.name}</span>
                    {place.address && <span className={styles.address}>{place.address}</span>}
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
