import type { Role } from '@/types';

/** Only allow same-site relative redirects (prevents open-redirects via ?next=). */
export function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

export function homeForRole(role: Role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'OWNER') return '/owner/dashboard';
  return '/listings';
}
