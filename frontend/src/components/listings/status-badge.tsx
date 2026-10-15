import { Badge } from '@/components/ui/badge';
import type { ListingStatus, VerificationStatus, VideoStatus } from '@/types';

const VARIANTS = {
  ACTIVE: 'success',
  APPROVED: 'success',
  READY: 'success',
  PENDING: 'warning',
  PROCESSING: 'warning',
  INACTIVE: 'secondary',
  RENTED: 'default',
  REJECTED: 'destructive',
  REMOVED: 'destructive',
  FAILED: 'destructive',
} as const;

export function StatusBadge({ status }: { status: ListingStatus | VerificationStatus | VideoStatus }) {
  return <Badge variant={VARIANTS[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
