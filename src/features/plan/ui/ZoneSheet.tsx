import { useId, useState } from 'react';
import searchIcon from '@/shared/assets/icons/search.svg';
import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import { searchZones, type PlanZone } from '../lib/planZones';
import styles from './ZoneSheet.module.css';

type ZoneSheetProps = {
  /** '1일차 · 11.14 (토)' */
  dayLabel: string;
  selectedZone: PlanZone | undefined;
  onSelectZone: (zone: PlanZone) => void;
};

// 여행 구역 선택(기능명세서 4-3) 아래쪽 시트. 검색어로 구역을 찾아 골라요
export default function ZoneSheet({ dayLabel, selectedZone, onSelectZone }: ZoneSheetProps) {
  const [query, setQuery] = useState(selectedZone?.name ?? '');
  const [isListOpen, setIsListOpen] = useState(false);
  const listId = useId();
  const results = searchZones(query);

  const chooseZone = (zone: PlanZone) => {
    setQuery(zone.name);
    setIsListOpen(false);
    onSelectZone(zone);
  };

  return (
    <section className={styles.sheet} aria-label="여행 구역 선택">
      <img src={handleIcon} alt="" className={styles.handle} />
      <h2 className={styles.title}>{dayLabel} 어디를 둘러볼까요?</h2>

      <div className={styles.field}>
        <input
          type="search"
          className={styles.input}
          placeholder="장소를 검색해주세요."
          value={query}
          aria-label="여행 구역 검색"
          aria-controls={listId}
          aria-expanded={isListOpen}
          onFocus={() => setIsListOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsListOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && results[0]) chooseZone(results[0]);
          }}
        />
        <img src={searchIcon} alt="" className={styles.searchIcon} />
      </div>

      {isListOpen && (
        <ul id={listId} className={styles.results} role="listbox">
          {results.length === 0 && <li className={styles.empty}>찾는 구역이 없어요.</li>}
          {results.map((zone) => (
            <li key={zone.name}>
              <button
                type="button"
                role="option"
                aria-selected={zone.name === selectedZone?.name}
                className={styles.result}
                onClick={() => chooseZone(zone)}
              >
                {zone.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
