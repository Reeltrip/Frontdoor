import { useState } from 'react';
import { Link } from 'react-router';
import AccountLayout from '@/features/account/ui/AccountLayout';
import AccountSwitch from '@/features/account/ui/AccountSwitch';
import styles from './AccountSettingsPage.module.css';

const PUSH_PREFERENCE_KEY = 'reeltrip:push-preference';

export default function AccountSettingsPage({ kind }: { kind: 'notifications' | 'app' }) {
  const [isPushEnabled, setIsPushEnabled] = useState(() => {
    try { return localStorage.getItem(PUSH_PREFERENCE_KEY) === 'true'; } catch { return false; }
  });
  const [message, setMessage] = useState('');
  const changePreference = (checked: boolean) => {
    try {
      localStorage.setItem(PUSH_PREFERENCE_KEY, String(checked));
      setIsPushEnabled(checked);
      setMessage('이 기기에 알림 설정을 저장했어요. 푸시 알림 발송 기능은 준비 중이에요.');
    } catch { setMessage('설정을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.'); }
  };
  return <AccountLayout title={kind === 'notifications' ? '푸시 알림 설정' : '앱 관리'}>
    <div className={styles.content}>
      {kind === 'notifications' ? <>
        <div className={styles.row}><span>푸시 알림 받기</span><AccountSwitch label="푸시 알림 받기" checked={isPushEnabled} onChange={changePreference} /></div>
        <p className={styles.description}>여행과 서비스에 관한 알림 수신 설정이에요.</p>
      </> : <>
        <div className={styles.row}><span>앱 버전</span><span>1.0.0</span></div>
        <Link className={styles.link} to="/my/feedback">1:1문의 피드백</Link>
      </>}
      {message && <p className={styles.description} role="status">{message}</p>}
    </div>
  </AccountLayout>;
}
