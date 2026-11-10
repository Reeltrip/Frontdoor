import type { RecentCollection } from "../model/recentCollection.types";

// 빈 배열로 바꾸면 홈의 빈 화면(2-2)을 볼 수 있음
export const FAKE_RECENT_COLLECTIONS: RecentCollection[] = [
  { id: "fake-1", date: "2026.10.29", title: "오사카 여행 플랜" },
  { id: "fake-2", date: "2026.09.01", title: "버킷리스트 유럽 여행" },
  { id: "fake-3", date: "2026.06.25", title: "부산 2박 3일" },
];
