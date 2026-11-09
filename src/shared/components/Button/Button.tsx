import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** filled: 검은 배경, outline: 테두리만, glass: 어두운 화면 위 반투명 (lg에서만) */
  variant?: 'filled' | 'outline' | 'glass';
  /** lg: 화면 하단 '다음' 같은 둥근 버튼(60px), md: 모달 안 버튼(52px), sm: 두 개 나란한 작은 버튼(48px) */
  size?: 'lg' | 'md' | 'sm';
  isFullWidth?: boolean;
};

export default function Button({
  variant = 'filled',
  size = 'lg',
  isFullWidth = true,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    isFullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classNames} {...rest} />;
}
