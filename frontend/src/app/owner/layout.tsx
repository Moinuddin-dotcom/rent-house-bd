import { RequireAuth } from '@/components/layout/require-auth';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={['OWNER']}>
      <div className="container py-8">{children}</div>
    </RequireAuth>
  );
}
