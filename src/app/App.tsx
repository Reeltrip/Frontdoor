import { RouterProvider } from 'react-router';
import { router } from '@/router';
import QueryProvider from '@/app/providers/QueryProvider';

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}
