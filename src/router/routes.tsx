import type { RouteObject } from "react-router";
import StartPage from "@/pages/StartPage/StartPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import SignupPage from "@/pages/SignupPage/SignupPage";
import NicknamePage from "@/pages/NicknamePage/NicknamePage";
import HomePage from "@/pages/HomePage/HomePage";
import ComponentTestPage from "@/pages/ComponentTestPage/ComponentTestPage";
import { canSeeDevPages } from "@/shared/lib/env";
import LibraryPage from "@/pages/LibraryPage/LibraryPage";

export const routes: RouteObject[] = [
  { path: "/", element: <StartPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/signup/nickname", element: <NicknamePage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/library", element: <LibraryPage /> },
  // 컴포넌트 테스트 페이지는 로컬과 Vercel 미리보기에서만 열림 (제출용 main 배포에는 안 나옴)
  ...(canSeeDevPages
    ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
    : []),
];
