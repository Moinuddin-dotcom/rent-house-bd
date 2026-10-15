'use client';

import { Building2, LayoutDashboard, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/owner-requests', label: 'Owner requests', icon: UserCheck },
  { href: '/admin/listings', label: 'Listings', icon: Building2 },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      <p className="mb-2 hidden px-3 text-xs font-semibold uppercase text-muted-foreground md:block">Admin panel</p>
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm',
              active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
