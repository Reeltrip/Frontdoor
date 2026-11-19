import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import AccountLayout from '@/features/account/ui/AccountLayout';
import AccountAvatar from '@/features/account/ui/AccountAvatar';
import AccountStatus from '@/features/account/ui/AccountStatus';
import { useProfile } from '@/features/account/model/useAccount';
import notificationIcon from '@/features/account/assets/notification.svg';
import helpIcon from '@/features/account/assets/help.svg';
import privacyIcon from '@/features/account/assets/privacy.svg';
import infoIcon from '@/features/account/assets/info.svg';
import logoutIcon from '@/features/account/assets/logout.svg';
import kebabIcon from '@/shared/assets/icons/kebab.svg';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { clearAuthTokens, getAuthTokens } from '@/shared/lib/authToken';
import { logout } from '@/features/auth/api/auth';
import { replayTutorials } from '@/features/account/lib/tutorialReplay';
import styles from './MyPage.module.css';

export default function MyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useProfile();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await queryClient.cancelQueries();
    // 서버에서 토큰을 못 지워도 이 기기에서는 로그아웃해요
    const refreshToken = getAuthTokens()?.refreshToken;
    if (refreshToken) await logout(refreshToken).catch(() => undefined);
    clearAuthTokens();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return <AccountLayout title="마이" hasBack={false} hasTabBar action={
    <div className={styles.menuWrap} ref={menuRef}>
      <button type="button" className={styles.more} aria-label="마이페이지 더보기" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}>
        <img src={kebabIcon} alt="" />
      </button>
      {isMenuOpen && <div className={styles.menu}>
        <button type="button" onClick={() => navigate('/my/profile')}>프로필 수정</button>
        <button type="button" onClick={() => navigate('/my/feedback')}>1:1문의 피드백</button>
      </div>}
    </div>
  }>
    <section className={styles.profileSection} aria-label="내 프로필">
      {profile.isPending || profile.isError || !profile.data ? <AccountStatus isLoading={profile.isPending} error={profile.error} onRetry={() => void profile.refetch()} /> :
        <button type="button" className={styles.profile} onClick={() => navigate('/my/profile')} aria-label="프로필 수정">
          <AccountAvatar isSmall avatarUrl={profile.data.avatarUrl} />
          <span className={styles.identity}><strong>{profile.data.nickname}님</strong><span>{profile.data.email}</span></span>
        </button>}
    </section>
    <nav className={styles.settings} aria-label="내 설정">
      <button type="button" className={styles.row} onClick={() => navigate('/my/notifications')}><span className={styles.icon}><img src={notificationIcon} alt="" /></span>푸시 알림 설정</button>
      <button type="button" className={styles.row} onClick={() => navigate('/my/terms')}><span className={styles.icon}><img src={helpIcon} alt="" /></span>이용약관</button>
      <button type="button" className={styles.row} onClick={() => navigate('/my/privacy')}><span className={styles.icon}><img src={privacyIcon} alt="" /></span>개인정보처리방침</button>
      {/* 본 기록을 지우고 가입 직후의 앱 안내부터 다시 보여줘요. 끝나면 홈에서 사용 안내가 이어져요 */}
      <button type="button" className={styles.row} onClick={() => { replayTutorials(); navigate('/welcome'); }}><span className={styles.icon}><img src={helpIcon} alt="" /></span>튜토리얼 다시 보기</button>
      <button type="button" className={styles.row} onClick={() => navigate('/my/app')}><span className={styles.icon}><img src={infoIcon} alt="" /></span><span>앱 관리<span className={styles.version}>1.0.0</span></span></button>
      <button type="button" className={`${styles.row} ${styles.logout}`} onClick={() => setIsLogoutOpen(true)}><span className={styles.icon}><img src={logoutIcon} alt="" /></span>로그아웃</button>
    </nav>
    <ConfirmModal isOpen={isLogoutOpen} icon="logout" presentation="account" title="정말로 로그아웃 하시겠어요?" cancelLabel="그만두기" confirmLabel={isLoggingOut ? '로그아웃 중' : '로그아웃'} isPending={isLoggingOut} onCancel={() => setIsLogoutOpen(false)} onConfirm={() => void handleLogout()} />
  </AccountLayout>;
}
