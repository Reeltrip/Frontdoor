import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** filled: 검은 배경, outline: 테두리만 */
  variant?: 'filled' | 'outline';
  /** lg: 화면 하단 '다음' 같은 둥근 버튼(60px), md: 모달 안 버튼(52px) */
  size?: 'lg' | 'md';
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
