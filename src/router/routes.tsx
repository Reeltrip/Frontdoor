import { Outlet, type RouteObject } from "react-router";
import RequireAuth from "./RequireAuth";
import RootRoute from "@/router/RootRoute";
import LoginPage from "@/pages/LoginPage/LoginPage";
import SignupPage from "@/pages/SignupPage/SignupPage";
import NicknamePage from "@/pages/NicknamePage/NicknamePage";
import HomePage from "@/pages/HomePage/HomePage";
import PlanCreatePage from "@/pages/PlanCreatePage/PlanCreatePage";
import PlanHomePage from "@/pages/PlanHomePage/PlanHomePage";
import PlanEditPage from "@/pages/PlanEditPage/PlanEditPage";
import PlanViewPage from "@/pages/PlanViewPage/PlanViewPage";
import ComponentTestPage from "@/pages/ComponentTestPage/ComponentTestPage";
import { canSeeDevPages } from "@/shared/lib/env";
import LibraryPage from "@/pages/LibraryPage/LibraryPage";
import LibraryTrashPage from "@/pages/LibraryTrashPage/LibraryTrashPage";
import LinkAddPage from "@/pages/LinkAddPage/LinkAddPage";
import LinkAnalyzingPage from "@/pages/LinkAnalyzingPage/LinkAnalyzingPage";
import ResultPage from "@/pages/ResultPage/ResultPage";
import CardBrowsePage from "@/pages/CardBrowsePage/CardBrowsePage";
import CardAddPage from "@/pages/CardAddPage/CardAddPage";
import TripListPage from "@/pages/TripListPage/TripListPage";

export const routes: RouteObject[] = [
  { path: "/", element: <RootRoute /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/signup/nickname", element: <NicknamePage /> },
  // 아래 화면은 로그인해야 들어갈 수 있어요
  {
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/library/trash", element: <LibraryTrashPage /> },
      { path: "/links/new", element: <LinkAddPage /> },
      { path: "/links/analyzing", element: <LinkAnalyzingPage /> },
      { path: "/result", element: <ResultPage /> },
      { path: "/cards", element: <CardBrowsePage /> },
      { path: "/cards/new", element: <CardAddPage /> },
      { path: "/plans", element: <PlanHomePage /> },
      { path: "/trips", element: <TripListPage /> },
      { path: "/plans/new", element: <PlanCreatePage /> },
      { path: "/plans/:planId", element: <PlanViewPage /> },
      { path: "/plans/:planId/edit", element: <PlanEditPage /> },
    ],
  },
  // 컴포넌트 테스트 페이지는 로컬과 Vercel 미리보기에서만 열림 (제출용 main 배포에는 안 나옴)
  ...(canSeeDevPages
    ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
    : []),
];
