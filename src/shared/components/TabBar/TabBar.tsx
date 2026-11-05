import menuIcon from '@/shared/assets/icons/tab-menu.svg';
import archiveIcon from '@/shared/assets/icons/tab-archive.svg';
import planIcon from '@/shared/assets/icons/tab-plan.svg';
import sourcesIcon from '@/shared/assets/icons/tab-sources.svg';
import profileIcon from '@/shared/assets/icons/tab-profile.svg';
import styles from './TabBar.module.css';

export type TabKey = 'menu' | 'archive' | 'plan' | 'sources' | 'profile';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'menu', label: '목록', icon: menuIcon },
  { key: 'archive', label: '보관', icon: archiveIcon },
  { key: 'plan', label: '계획', icon: planIcon },
  { key: 'sources', label: '자료', icon: sourcesIcon },
  { key: 'profile', label: '마이', icon: profileIcon },
];

type TabBarProps = {
  activeTab: TabKey;
  onChange?: (tab: TabKey) => void;
  className?: string;
};

// 화면 아래에 떠 있는 탭 바
export default function TabBar({ activeTab, onChange, className }: TabBarProps) {
  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);

  return (
    <nav className={[styles.bar, className].filter(Boolean).join(' ')} aria-label="메인 메뉴">
      <span
        className={styles.indicator}
        style={{ transform: `translateX(${activeIndex * 66}px)` }}
        aria-hidden
      />
      <ul className={styles.list}>
        {TABS.map((tab) => (
          <li key={tab.key}>
            <button
              type="button"
              className={styles.tab}
              aria-current={tab.key === activeTab ? 'page' : undefined}
              onClick={() => onChange?.(tab.key)}
            >
              <span className={styles.iconBox}>
                <img src={tab.icon} alt="" />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
