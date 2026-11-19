import { useEffect } from 'react';

/** 화면이 따로 정하지 않았을 때의 바탕색 (index.html의 theme-color와 같아요) */
const DEFAULT_BACKDROP = '#ffffff';

/** 어두운 화면 (계획 홈·새 여행계획·시작 화면) */
export const DARK_BACKDROP = '#1a1a1a';
/** 위쪽이 연두색으로 시작하는 화면 (자료·링크 추가). --color-lime-50과 같은 값이에요 */
export const LIME_BACKDROP = '#efffbe';

/**
 * 상태바 뒤에 깔리는 색을 이 화면의 위쪽 색에 맞춰요.
 * 아이폰은 body 바탕색을, 안드로이드는 theme-color를 상태바 자리에 칠해서
 * 화면 배경과 다르면 노치 아래에서 색이 끊겨 보여요. 화면을 떠나면 기본색으로 돌아가요
 *
 * hasStatusBarCap=false면 폰 맨 위 단색 띠(StatusBarCap)를 빼요. 사진이 맨 위까지 깔리고 위쪽에 글자가 없는
 * 화면은 띠가 있으면 사진이 상태바 아래에서 끊겨 보여요. 띠가 없으면 아이폰이 맨 위를 흐리게 하지만 사진 위라 티가 안 나요 (#119)
 */
export function useScreenBackdrop(color: string, { hasStatusBarCap = true }: { hasStatusBarCap?: boolean } = {}) {
  useEffect(() => {
    const root = document.documentElement;
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    root.style.setProperty('--screen-backdrop', color);
    if (!hasStatusBarCap) root.style.setProperty('--status-bar-cap', 'none');
    if (themeColor) themeColor.content = color;
    return () => {
      root.style.removeProperty('--screen-backdrop');
      root.style.removeProperty('--status-bar-cap');
      if (themeColor) themeColor.content = DEFAULT_BACKDROP;
    };
  }, [color, hasStatusBarCap]);
}
