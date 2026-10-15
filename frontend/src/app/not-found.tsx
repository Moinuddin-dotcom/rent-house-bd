import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t find that page.</p>
      <Button asChild className="mt-6">
        <Link href="/listings">Browse rentals</Link>
      </Button>
    </div>
  );
}
