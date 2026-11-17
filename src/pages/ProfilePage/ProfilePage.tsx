import { useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router';
import AccountLayout from '@/features/account/ui/AccountLayout';
import AccountAvatar from '@/features/account/ui/AccountAvatar';
import AccountStatus from '@/features/account/ui/AccountStatus';
import { useProfile, useUpdateProfile } from '@/features/account/model/useAccount';
import type { AccountProfile } from '@/features/account/model/account.types';
import editIcon from '@/features/account/assets/avatar-edit.svg';
import closeIcon from '@/shared/assets/icons/close.svg';
import Button from '@/shared/components/Button';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { NICKNAME_MAX_LENGTH } from '@/features/auth/model/useNicknameForm';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const profile = useProfile();
  return <>{profile.data ? <ProfileForm profile={profile.data} /> :
    <AccountLayout title="프로필 수정"><AccountStatus isLoading={profile.isPending} error={profile.error} onRetry={() => void profile.refetch()} /></AccountLayout>}
  </>;
}

function ProfileForm({ profile }: { profile: AccountProfile }) {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const isDirty = nickname.trim() !== profile.nickname || avatarUrl !== profile.avatarUrl;
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isDirty && currentLocation.pathname !== nextLocation.pathname);
  const isConfirming = isSaveConfirmOpen || blocker.state === 'blocked';

  useBeforeUnload((event) => {
    if (isDirty) { event.preventDefault(); event.returnValue = ''; }
  });

  const requestSave = () => {
    if (!nickname.trim()) {
      setErrorMessage('닉네임은 1자에서 8자까지 입력해주세요.');
      nicknameRef.current?.focus();
      return;
    }
    if (isDirty) setIsSaveConfirmOpen(true);
    else setIsEditing(false);
  };

  const handleSubmit = (event: SyntheticEvent) => { event.preventDefault(); requestSave(); };

  const discardChanges = () => {
    setNickname(profile.nickname);
    setAvatarUrl(profile.avatarUrl);
    setIsSaveConfirmOpen(false);
    setIsEditing(false);
    setErrorMessage('');
    if (blocker.state === 'blocked') blocker.proceed();
  };

  const saveChanges = () => {
    if (!nickname.trim()) {
      setIsSaveConfirmOpen(false);
      if (blocker.state === 'blocked') blocker.reset();
      setErrorMessage('닉네임은 1자에서 8자까지 입력해주세요.');
      return;
    }
    updateProfile.mutate({ nickname: nickname.trim(), avatarUrl }, {
      onSuccess: () => {
        setNickname(nickname.trim());
        setIsSaveConfirmOpen(false);
        setIsEditing(false);
        setStatusMessage('프로필을 저장했어요.');
        if (blocker.state === 'blocked') blocker.proceed();
      },
      onError: (error) => {
        setIsSaveConfirmOpen(false);
        if (blocker.state === 'blocked') blocker.reset();
        setErrorMessage(error.message || '저장하지 못했어요. 다시 시도해 주세요.');
      },
    });
  };

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    // 서버가 PNG·JPEG만 받아요
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 3 * 1024 * 1024) {
      setErrorMessage('3MB 이하의 JPG, PNG 사진을 선택해 주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const result = reader.result;
        const image = new Image();
        image.onload = () => {
          setAvatarUrl(result);
          setIsEditing(true);
          setErrorMessage('');
        };
        image.onerror = () => setErrorMessage('사진 파일을 읽을 수 없어요. 다른 사진을 선택해 주세요.');
        image.src = result;
      }
    };
    reader.onerror = () => setErrorMessage('사진을 불러오지 못했어요. 다시 선택해 주세요.');
    reader.readAsDataURL(file);
  };

  return <AccountLayout title="프로필 수정" onBack={() => navigate('/my')} action={
    isEditing && !isConfirming ? <button type="button" className={styles.close} aria-label="편집 끝내기" onClick={requestSave}><img src={closeIcon} alt="" /></button> :
      <button type="button" className={styles.edit} onClick={() => { setIsEditing(true); setStatusMessage(''); }}>편집</button>
  }>
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.avatar}>
        <AccountAvatar avatarUrl={avatarUrl} />
        <button type="button" className={styles.photoButton} aria-label="프로필 사진 변경" onClick={() => fileInputRef.current?.click()}><img src={editIcon} alt="" /></button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className={styles.fileInput} onChange={selectPhoto} />
      </div>
      <div className={styles.fields}>
        <label className={styles.field}>닉네임
          <input ref={nicknameRef} name="nickname" value={nickname} readOnly={!isEditing} autoFocus={isEditing} key={isEditing ? 'editing' : 'viewing'} maxLength={NICKNAME_MAX_LENGTH} autoComplete="nickname" aria-invalid={Boolean(errorMessage)} aria-describedby={errorMessage ? 'profile-error' : undefined} onChange={(event) => { setNickname(event.target.value); setErrorMessage(''); }} />
        </label>
        <label className={styles.field}>이메일<input name="email" type="email" value={profile.email} readOnly autoComplete="email" /></label>
        {errorMessage && <p id="profile-error" className={styles.error} role="alert">{errorMessage}</p>}
        {statusMessage && <p className={styles.status} role="status">{statusMessage}</p>}
      </div>
      {isEditing && !isConfirming && <div className={styles.save}><Button type="submit" disabled={updateProfile.isPending}>저장하기</Button></div>}
    </form>
    <ConfirmModal isOpen={isConfirming} icon="alert" presentation="account" title="변경사항이 감지되었어요." description="변경하신 내용을 저장할까요?" cancelLabel="그만두기" confirmLabel={updateProfile.isPending ? '저장 중' : '저장하기'} isPending={updateProfile.isPending} isDismissible={false} onCancel={discardChanges} onConfirm={saveChanges} />
  </AccountLayout>;
}
