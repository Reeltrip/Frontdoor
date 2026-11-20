import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import AccountLayout from '@/features/account/ui/AccountLayout';
import AccountStatus from '@/features/account/ui/AccountStatus';
import { useProfile } from '@/features/account/model/useAccount';
import helpIcon from '@/features/account/assets/help.svg';
import privacyIcon from '@/features/account/assets/privacy.svg';
import logoutIcon from '@/features/account/assets/logout.svg';
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

  return (
    <AccountLayout title="마이" hasBack={false} hasTabBar className={styles.page}>
      <section className={styles.profileSection} aria-label="내 프로필">
        {profile.isPending || profile.isError || !profile.data ? (
          <AccountStatus
            isLoading={profile.isPending}
            error={profile.error}
            onRetry={() => void profile.refetch()}
          />
        ) : (
          <button
            type="button"
            className={styles.profile}
            aria-label={`${profile.data.nickname}님, ${profile.data.email}, 프로필 수정`}
            onClick={() => navigate('/my/profile')}
          >
            <strong>{profile.data.nickname}님</strong>
            <span>{profile.data.email}</span>
          </button>
        )}
      </section>
      <nav className={styles.settings} aria-label="내 설정">
        {/* 본 기록을 지우고 앱 안내부터 카드 안내까지 차례로 다시 보여줘요 (#124, #179). 피그마 개편 때 빠져서 되살렸어요 (#207) */}
        <button type="button" className={styles.row} onClick={() => { replayTutorials(); navigate('/welcome'); }}>
          <span className={styles.icon}><img src={helpIcon} alt="" /></span>
          튜토리얼 다시 보기
        </button>
        <button type="button" className={styles.row} onClick={() => navigate('/my/terms')}>
          <span className={styles.icon}><img src={helpIcon} alt="" /></span>
          이용약관
        </button>
        <button type="button" className={styles.row} onClick={() => navigate('/my/privacy')}>
          <span className={styles.icon}><img src={privacyIcon} alt="" /></span>
          개인정보처리방침
        </button>
        <button
          type="button"
          className={`${styles.row} ${styles.logout}`}
          onClick={() => setIsLogoutOpen(true)}
        >
          <span className={styles.icon}><img src={logoutIcon} alt="" /></span>
          로그아웃
        </button>
      </nav>
      <ConfirmModal
        isOpen={isLogoutOpen}
        icon="logout"
        presentation="account"
        title="정말로 로그아웃 하시겠어요?"
        cancelLabel="그만두기"
        confirmLabel={isLoggingOut ? '로그아웃 중' : '로그아웃'}
        isPending={isLoggingOut}
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </AccountLayout>
  );
}
