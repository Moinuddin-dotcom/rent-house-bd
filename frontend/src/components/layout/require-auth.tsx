'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/types';

/** Client-side guard for pages that need a logged-in user (optionally with a given role). */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && (!roles || roles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (!allowed) router.replace('/');
  }, [loading, user, allowed, router, pathname]);

  if (loading || !allowed) {
    return (
      <div className="container space-y-4 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}
