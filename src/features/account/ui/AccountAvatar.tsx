import background from '../assets/avatar-background.svg';
import smallBackground from '../assets/avatar-background-small.svg';
import user from '../assets/avatar-user.svg';
import smallUser from '../assets/avatar-user-small.svg';
import styles from './AccountAvatar.module.css';

export default function AccountAvatar({ avatarUrl, isSmall = false }: { avatarUrl?: string; isSmall?: boolean }) {
  return (
    <span className={isSmall ? styles.small : styles.avatar}>
      {avatarUrl ? <img className={styles.photo} src={avatarUrl} alt="프로필 사진" /> : <>
        <img className={styles.background} src={isSmall ? smallBackground : background} alt="" />
        <img className={styles.user} src={isSmall ? smallUser : user} alt="" />
      </>}
    </span>
  );
}
