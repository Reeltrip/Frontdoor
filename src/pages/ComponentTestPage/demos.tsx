import type { ReactNode } from 'react';

export type ComponentDemo = {
  /** 컴포넌트 이름 */
  name: string;
  /** 파일 위치. 예: shared/components/Button */
  path: string;
  description?: string;
  /** 상태별로 하나씩. 예: 기본, 비활성, 로딩 */
  variants: { label: string; render: () => ReactNode }[];
};

/*
 * 새 컴포넌트를 만들면 여기에 추가하면 테스트 페이지에 바로 보여요.
 *
 * {
 *   name: 'Button',
 *   path: 'shared/components/Button',
 *   description: '기본 버튼',
 *   variants: [
 *     { label: '기본', render: () => <Button>저장</Button> },
 *     { label: '비활성', render: () => <Button disabled>저장</Button> },
 *   ],
 * },
 */
export const componentDemos: ComponentDemo[] = [];
