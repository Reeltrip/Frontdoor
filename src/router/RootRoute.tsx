import { Navigate } from 'react-router';
import StartPage from '@/pages/StartPage/StartPage';
import { hasAuthTokens } from '@/shared/lib/authToken';

export default function RootRoute() {
  return hasAuthTokens() ? <Navigate to="/home" replace /> : <StartPage />;
}
