import { RouterProvider } from 'react-router';
import { router } from '@/router';
import QueryProvider from '@/app/providers/QueryProvider';
import StatusBarCap from '@/shared/components/StatusBarCap/StatusBarCap';

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <StatusBarCap />
    </QueryProvider>
  );
}
