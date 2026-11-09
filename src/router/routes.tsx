import type { RouteObject } from "react-router";
import StartPage from "@/pages/StartPage/StartPage";
import HomePage from "@/pages/HomePage/HomePage";
import ComponentTestPage from "@/pages/ComponentTestPage/ComponentTestPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import SignupPage from "@/pages/SignupPage/SignupPage";

export const routes: RouteObject[] = [
  { path: "/", element: <StartPage /> },
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  // 컴포넌트 테스트 페이지는 로컬 개발에서만 열림 (제출용 배포 URL에는 안 나옴)
  ...(import.meta.env.DEV
    ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
    : []),
];
