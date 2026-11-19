type TransitLegIconProps = { className?: string };

// transit-small.svg와 같은 그림이에요. 바탕색을 구간 색(currentColor)으로 바꿀 수 있게 코드로 옮겼어요
export default function TransitLegIcon({ className }: TransitLegIconProps) {
  const line = { stroke: 'var(--color-white)', strokeWidth: 0.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path d="M10.4587 11.0832V12.3332" {...line} />
      <path d="M5.87533 11.0832V12.3332" {...line} />
      <path
        d="M4.83366 7.33317C4.83366 5.76182 4.83366 4.97615 5.32181 4.48799C5.80997 3.99984 6.59564 3.99984 8.16699 3.99984C9.73834 3.99984 10.524 3.99984 11.0122 4.48799C11.5003 4.97615 11.5003 5.76182 11.5003 7.33317V8.58317C11.5003 9.76168 11.5003 10.3509 11.1342 10.7171C10.7681 11.0832 10.1788 11.0832 9.00033 11.0832H7.33366C6.15515 11.0832 5.56589 11.0832 5.19978 10.7171C4.83366 10.3509 4.83366 9.76168 4.83366 8.58317V7.33317Z"
        fill="currentColor"
        {...line}
      />
      <path d="M4.83366 8.1665C5.6074 8.40616 6.83748 8.58318 8.16699 8.58318C9.4965 8.58318 10.7266 8.40616 11.5003 8.1665" {...line} />
      <path d="M11.5003 7.95817L11.5443 7.93618C11.7894 7.81363 12.0596 7.74984 12.3337 7.74984" {...line} />
      <path d="M4.83366 7.95817L4.78967 7.93618C4.54459 7.81363 4.27434 7.74984 4.00033 7.74984" {...line} />
      <path d="M5.04199 9.83317H5.66699" {...line} />
      <path d="M10.667 9.83317H11.292" {...line} />
      <path d="M7.33366 9.83317H9.00033" {...line} />
    </svg>
  );
}
