import { useEffect, useRef, useState, type KeyboardEvent, type SyntheticEvent } from 'react';
import AccountLayout from '@/features/account/ui/AccountLayout';
import AccountSwitch from '@/features/account/ui/AccountSwitch';
import { useSubmitInquiry } from '@/features/account/model/useAccount';
import { INQUIRY_TYPES, type InquiryType } from '@/features/account/model/account.types';
import chevron from '@/features/account/assets/feedback-chevron.svg';
import openChevron from '@/features/account/assets/feedback-chevron-open.svg';
import Button from '@/shared/components/Button';
import { isFakeApiEnabled } from '@/shared/lib/env';
import styles from './FeedbackPage.module.css';

const MAX_CONTENT_LENGTH = 300;

export default function FeedbackPage() {
  const inquiry = useSubmitInquiry();
  const [type, setType] = useState<InquiryType | null>(null);
  const [content, setContent] = useState('');
  const [wantsReplyNotification, setWantsReplyNotification] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event: PointerEvent) => {
      if (!selectRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [isOpen]);

  const selectType = (value: InquiryType) => {
    setType(value);
    setIsOpen(false);
    setMessage('');
    triggerRef.current?.focus();
  };

  const handleOptionKey = (event: KeyboardEvent, index: number) => {
    if (event.key === 'Escape') { setIsOpen(false); triggerRef.current?.focus(); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + INQUIRY_TYPES.length) % INQUIRY_TYPES.length;
      optionRefs.current[next]?.focus();
    }
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!type) { setMessage('문의 유형을 선택해 주세요.'); setIsOpen(true); return; }
    if (!content.trim()) { setMessage('문의 내용을 입력해 주세요.'); textareaRef.current?.focus(); return; }
    inquiry.mutate({ type, content: content.trim(), wantsReplyNotification }, {
      onSuccess: () => {
        setType(null);
        setContent('');
        setWantsReplyNotification(false);
        setMessage(isFakeApiEnabled ? '시연용 문의를 이 기기에 저장했어요.' : '문의를 접수했어요.');
      },
      onError: (error) => setMessage(error.message || '저장하지 못했어요. 다시 시도해 주세요.'),
    });
  };

  return <AccountLayout title="1:1문의 피드백">
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.body}>
        <div className={styles.select} ref={selectRef}>
          <button ref={triggerRef} type="button" className={styles.trigger} aria-expanded={isOpen} aria-controls="inquiry-options" onClick={() => setIsOpen((open) => !open)} onKeyDown={(event) => {
            if (event.key === 'ArrowDown') { event.preventDefault(); setIsOpen(true); requestAnimationFrame(() => optionRefs.current[0]?.focus()); }
            if (event.key === 'Escape') setIsOpen(false);
          }}>
            <span>{type ?? '문의 유형을 선택하세요.'}</span><span className={styles.chevron}><img src={chevron} alt="" /></span>
          </button>
          {isOpen && <div className={styles.options} id="inquiry-options" aria-label="문의 유형">
            <button type="button" className={styles.option} onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}><span>{type ?? '문의 유형을 선택하세요.'}</span><span className={styles.openChevron}><img src={openChevron} alt="" /></span></button>
            {INQUIRY_TYPES.map((value, index) => <button key={value} ref={(element) => { optionRefs.current[index] = element; }} type="button" className={styles.option} aria-pressed={type === value} onClick={() => selectType(value)} onKeyDown={(event) => handleOptionKey(event, index)}>{value}</button>)}
          </div>}
        </div>
        <p className={styles.hint}>Wayvi를 사용하시며 불편했던 점이나<br />추가되었으면 하는 기능을 편하게 알려주세요.</p>
        <label className={styles.contentLabel} htmlFor="inquiry-content">문의 내용</label>
        <textarea id="inquiry-content" ref={textareaRef} className={styles.textarea} placeholder="내용을 입력해주세요" value={content} maxLength={MAX_CONTENT_LENGTH} disabled={inquiry.isPending} onChange={(event) => { setContent(event.target.value); setMessage(''); }} />
        <p className={styles.count}>({content.length}/{MAX_CONTENT_LENGTH})</p>
        {message && <p className={styles.message} role={inquiry.isError ? 'alert' : 'status'}>{message}</p>}
      </div>
      <div className={styles.footer}>
        <div className={styles.notification}><span>앱으로 답변 알림 받기</span><AccountSwitch label="앱으로 답변 알림 받기" checked={wantsReplyNotification} onChange={setWantsReplyNotification} /></div>
        <Button type="submit" disabled={inquiry.isPending}>{inquiry.isPending ? '저장 중' : '저장하기'}</Button>
      </div>
    </form>
  </AccountLayout>;
}
