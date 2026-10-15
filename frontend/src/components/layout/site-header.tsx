'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Home, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { SITE_NAME } from '@/lib/constants';

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/listings', label: 'Browse rentals', show: true },
    { href: '/favorites', label: 'Favourites', show: !!user, icon: Heart },
    { href: '/owner/dashboard', label: 'Owner dashboard', show: user?.role === 'OWNER', icon: LayoutDashboard },
    { href: '/admin', label: 'Admin', show: user?.role === 'ADMIN', icon: ShieldCheck },
  ].filter((l) => l.show);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Home className="h-5 w-5" />
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Button key={l.href} variant="ghost" asChild>
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, {user.name.split(' ')[0]}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register?type=OWNER">List your property</Link>
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded px-2 py-2 hover:bg-accent">
                {l.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="rounded px-2 py-2 text-left hover:bg-accent">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded px-2 py-2 hover:bg-accent">
                  Log in
                </Link>
                <Link
                  href="/register?type=OWNER"
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2 font-medium text-primary hover:bg-accent"
                >
                  List your property
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
