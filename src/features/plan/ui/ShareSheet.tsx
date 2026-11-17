import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import type { ShareType } from '../model/plan.types';
import styles from './ShareSheet.module.css';

/** more: 기기의 공유 창 / instagram·copy: 링크 복사 / message: 문자 앱 */
export type ShareChannel = 'more' | 'instagram' | 'copy' | 'message';

type ShareSheetProps = {
  shareType: ShareType;
  onChangeShareType: (shareType: ShareType) => void;
  isPending: boolean;
  /** 방금 만든 공유 링크. 복사가 막힌 브라우저에서 직접 복사할 수 있게 보여줘요 */
  sharedUrl: string | null;
  message: string | null;
  onShare: (channel: ShareChannel) => void;
  onClose: () => void;
};

const SHARE_TYPE_LABELS: Record<ShareType, string> = { READ_ONLY: '읽기 전용', EDIT: '함께 편집' };

const DESCRIPTIONS: Record<ShareType, string> = {
  READ_ONLY: '링크로 접속하면 여행계획을 함께 볼 수 있어요.',
  EDIT: '링크로 접속한 친구가 로그인하면 함께 고칠 수 있어요.',
};

// 계획 공유하기 (피그마 S4-7 계획 완성 보기 > 공유하기). 검은 버튼을 누르면 읽기 전용 ↔ 함께 편집이 바뀌어요
export default function ShareSheet({
  shareType,
  onChangeShareType,
  isPending,
  sharedUrl,
  message,
  onShare,
  onClose,
}: ShareSheetProps) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="공유하기"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={handleIcon} alt="" className={styles.handle} />
        <h2 className={styles.title}>공유하기</h2>
        <p className={styles.description}>{DESCRIPTIONS[shareType]}</p>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            그만두기
          </button>
          <button
            type="button"
            className={styles.shareType}
            aria-label={`공유 방식: ${SHARE_TYPE_LABELS[shareType]}. 누르면 바뀌어요`}
            onClick={() => onChangeShareType(shareType === 'READ_ONLY' ? 'EDIT' : 'READ_ONLY')}
          >
            {SHARE_TYPE_LABELS[shareType]}
          </button>
        </div>

        <ul className={styles.channels}>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('more')}>
              <span className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="6" cy="12" r="1.8" fill="#4d4d4d" />
                  <circle cx="12" cy="12" r="1.8" fill="#4d4d4d" />
                  <circle cx="18" cy="12" r="1.8" fill="#4d4d4d" />
                </svg>
              </span>
              더보기
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('instagram')}>
              <span className={`${styles.channelIcon} ${styles.instagram}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" fill="#fff" stroke="none" />
                </svg>
              </span>
              instagram
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('copy')}>
              <span className={styles.channelIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4d4d4d" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
                  <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                </svg>
              </span>
              링크복사
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('message')}>
              <span className={`${styles.channelIcon} ${styles.messageIcon}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4C7.3 4 3.5 7.1 3.5 11c0 2.2 1.2 4.1 3.1 5.4L6 20l3.6-1.5c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.1 8.5-7S16.7 4 12 4Z" fill="#fff" />
                </svg>
              </span>
              메시지
            </button>
          </li>
        </ul>

        {sharedUrl && <p className={styles.url}>{sharedUrl}</p>}
        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
