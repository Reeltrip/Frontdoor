import { createBrowserRouter } from 'react-router';
import ErrorPage from '@/pages/ErrorPage/ErrorPage';
import { routes } from './routes';

// 모든 화면을 하나로 감싸서, 어느 화면에서 오류가 나도 ErrorPage를 보여 줘요
export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [...routes, { path: '*', element: <ErrorPage isNotFound /> }],
  },
]);
