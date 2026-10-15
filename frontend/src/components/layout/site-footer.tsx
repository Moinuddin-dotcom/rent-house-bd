import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="container grid gap-6 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="font-semibold">{SITE_NAME}</p>
          <p className="mt-2 text-muted-foreground">
            Free house &amp; flat rentals across Bangladesh. No fees for renters or owners.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Renters</p>
          <Link href="/listings" className="text-muted-foreground hover:text-foreground">Browse rentals</Link>
          <Link href="/register" className="text-muted-foreground hover:text-foreground">Create an account</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Owners</p>
          <Link href="/register?type=OWNER" className="text-muted-foreground hover:text-foreground">Register as owner</Link>
          <Link href="/owner/dashboard" className="text-muted-foreground hover:text-foreground">Owner dashboard</Link>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
