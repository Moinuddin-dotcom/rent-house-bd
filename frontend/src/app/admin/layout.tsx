import { AdminNav } from './admin-nav';
import { RequireAuth } from '@/components/layout/require-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={['ADMIN']}>
      <div className="container grid gap-8 py-8 md:grid-cols-[200px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </RequireAuth>
  );
}
