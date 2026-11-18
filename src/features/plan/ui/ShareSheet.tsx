import handleIcon from '@/shared/assets/icons/sheet-handle.svg';
import kebabIcon from '@/shared/assets/icons/kebab.svg';
import instagramFrame from '../assets/share-instagram-frame.svg';
import instagramLens from '../assets/share-instagram-lens.svg';
import instagramFlash from '../assets/share-instagram-flash.svg';
import linkIcon from '../assets/share-link.svg';
import messageIcon from '../assets/share-message.svg';
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
                <img className={styles.moreIcon} src={kebabIcon} alt="" />
              </span>
              더보기
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('instagram')}>
              <span className={`${styles.channelIcon} ${styles.instagram}`}>
                <img src={instagramFrame} alt="" />
                <img src={instagramLens} alt="" />
                <img className={styles.instagramFlash} src={instagramFlash} alt="" />
              </span>
              instagram
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('copy')}>
              <span className={styles.channelIcon}>
                <img src={linkIcon} alt="" />
              </span>
              링크복사
            </button>
          </li>
          <li>
            <button type="button" className={styles.channel} disabled={isPending} onClick={() => onShare('message')}>
              <img className={styles.messageIcon} src={messageIcon} alt="" />
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
