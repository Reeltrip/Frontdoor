/** 구간 색 가짓수. index.css의 --color-route-leg-1 ~ 6과 맞춰요 */
export const ROUTE_LEG_COLOR_COUNT = 6;

/**
 * 계획 보기에서 동선을 구간 순서대로 다른 색으로 그려요. 지도 선과 일정 목록이 같은 색을 써서 어느 구간인지 맞춰 볼 수 있어요.
 * 구간이 여섯 개를 넘으면 처음 색부터 다시 써요.
 */
export const getRouteLegColorToken = (legIndex: number) => `--color-route-leg-${(legIndex % ROUTE_LEG_COLOR_COUNT) + 1}`;
