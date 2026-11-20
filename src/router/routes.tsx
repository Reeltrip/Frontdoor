import { Outlet, type RouteObject } from "react-router";
import RequireAuth from "./RequireAuth";
import RootRoute from "@/router/RootRoute";
import LoginPage from "@/pages/LoginPage/LoginPage";
import SignupPage from "@/pages/SignupPage/SignupPage";
import NicknamePage from "@/pages/NicknamePage/NicknamePage";
import HomePage from "@/pages/HomePage/HomePage";
import PlanTutorialTourPage from "@/pages/PlanTutorialTourPage/PlanTutorialTourPage";
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
import MyPage from "@/pages/MyPage/MyPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import AccountPolicyPage from "@/pages/AccountPolicyPage/AccountPolicyPage";
import FeedbackPage from "@/pages/FeedbackPage/FeedbackPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage/AccountSettingsPage";
import OnboardingGuidePage from "@/pages/OnboardingGuidePage/OnboardingGuidePage";
import PlanInfoEditPage from "@/pages/PlanInfoEditPage/PlanInfoEditPage";

export const routes: RouteObject[] = [
  { path: "/", element: <RootRoute /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/signup/nickname", element: <NicknamePage /> },
  // 공유 링크. 읽기 전용으로 공유한 계획은 로그인 없이 볼 수 있어요
  { path: "/plan/:planId", element: <PlanViewPage /> },
  // 아래 화면은 로그인해야 들어갈 수 있어요
  {
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: [
      // 가입 직후 한 번 보여주는 앱 사용안내 3장
      { path: "/welcome", element: <OnboardingGuidePage /> },
      { path: "/home", element: <HomePage /> },
      // 튜토리얼 다시 보기의 여행계획 확정·플랜 B 안내 (#238)
      { path: "/tutorial/plan", element: <PlanTutorialTourPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/library/trash", element: <LibraryTrashPage /> },
      { path: "/links/new", element: <LinkAddPage /> },
      { path: "/links/analyzing", element: <LinkAnalyzingPage /> },
      { path: "/result", element: <ResultPage /> },
      { path: "/cards", element: <CardBrowsePage /> },
      { path: "/cards/new", element: <CardAddPage /> },
      { path: "/plans", element: <PlanHomePage /> },
      { path: "/trips", element: <TripListPage /> },
      { path: "/my", element: <MyPage /> },
      { path: "/my/profile", element: <ProfilePage /> },
      { path: "/my/terms", element: <AccountPolicyPage kind="terms" /> },
      { path: "/my/privacy", element: <AccountPolicyPage kind="privacy" /> },
      { path: "/my/feedback", element: <FeedbackPage /> },
      { path: "/my/notifications", element: <AccountSettingsPage kind="notifications" /> },
      { path: "/my/app", element: <AccountSettingsPage kind="app" /> },
      { path: "/plans/new", element: <PlanCreatePage /> },
      { path: "/plans/:planId", element: <PlanViewPage /> },
      { path: "/plans/:planId/edit", element: <PlanEditPage /> },
      // 계획 편집: 여행 이름·기간·주소를 고쳐요 (동선 편집은 위 /edit)
      { path: "/plans/:planId/info", element: <PlanInfoEditPage /> },
    ],
  },
  // 컴포넌트 테스트 페이지는 로컬과 Vercel 미리보기에서만 열림 (제출용 main 배포에는 안 나옴)
  ...(canSeeDevPages
    ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
    : []),
];
