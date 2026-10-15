import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
