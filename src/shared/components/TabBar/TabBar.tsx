import menuIcon from '@/shared/assets/icons/tab-menu.svg';
import archiveIcon from '@/shared/assets/icons/tab-archive.svg';
import planIcon from '@/shared/assets/icons/tab-plan.svg';
import sourcesIcon from '@/shared/assets/icons/tab-sources.svg';
import profileIcon from '@/shared/assets/icons/tab-profile.svg';
import menuLightIcon from '@/shared/assets/icons/tab-menu-light.svg';
import archiveLightIcon from '@/shared/assets/icons/tab-archive-light.svg';
import planLightIcon from '@/shared/assets/icons/tab-plan-light.svg';
import sourcesLightIcon from '@/shared/assets/icons/tab-sources-light.svg';
import profileLightIcon from '@/shared/assets/icons/tab-profile-light.svg';
import { useNavigate } from 'react-router';
import styles from './TabBar.module.css';

export type TabKey = 'menu' | 'archive' | 'plan' | 'sources' | 'profile';

const TABS: { key: TabKey; label: string; icon: string; lightIcon: string }[] = [
  { key: 'menu', label: '목록', icon: menuIcon, lightIcon: menuLightIcon },
  { key: 'archive', label: '보관', icon: archiveIcon, lightIcon: archiveLightIcon },
  { key: 'plan', label: '계획', icon: planIcon, lightIcon: planLightIcon },
  { key: 'sources', label: '자료', icon: sourcesIcon, lightIcon: sourcesLightIcon },
  { key: 'profile', label: '마이', icon: profileIcon, lightIcon: profileLightIcon },
];

/**
 * 탭을 누르면 가는 화면. 없는 탭은 아직 화면이 없어서 눌러도 그대로예요.
 * 목록(여행목록)은 화면이 생기기 전까지 홈으로 보내요
 */
export const TAB_PATHS: Partial<Record<TabKey, string>> = {
  menu: '/home',
  archive: '/library',
  plan: '/plans',
  sources: '/home',
};

type TabBarProps = {
  activeTab: TabKey;
  /** 없으면 TAB_PATHS로 이동해요 */
  onChange?: (tab: TabKey) => void;
  /** dark: 어두운 배경 위 (여행계획 홈) */
  theme?: 'light' | 'dark';
  className?: string;
};

// 화면 아래에 떠 있는 탭 바
export default function TabBar({ activeTab, onChange, theme = 'light', className }: TabBarProps) {
  const navigate = useNavigate();
  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const isDark = theme === 'dark';

  const handleClick = (tab: TabKey) => {
    if (onChange) return onChange(tab);
    const path = TAB_PATHS[tab];
    if (path && tab !== activeTab) navigate(path);
  };

  return (
    <nav
      className={[styles.bar, isDark && styles.dark, className].filter(Boolean).join(' ')}
      aria-label="메인 메뉴"
    >
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
              onClick={() => handleClick(tab.key)}
            >
              <span className={styles.iconBox}>
                <img src={isDark ? tab.lightIcon : tab.icon} alt="" />
              </span>
              <span className={styles.label}>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
