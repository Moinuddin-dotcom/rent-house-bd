'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ExternalLink, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/listings/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api-client';
import { DOCUMENT_TYPES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { OwnerProfile } from '@/types';

const reviewSchema = z.object({ note: z.string().max(1000).optional() });
type ReviewValues = z.infer<typeof reviewSchema>;

export default function OwnerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: request, loading, error } = useApi<OwnerProfile>(`/admin/owner-requests/${id}`);
  const form = useForm<ReviewValues>({ resolver: zodResolver(reviewSchema), defaultValues: { note: '' } });

  const review = async (decision: 'APPROVED' | 'REJECTED') => {
    const note = form.getValues('note')?.trim();
    if (decision === 'REJECTED' && (!note || note.length < 3)) {
      form.setError('note', { message: 'Tell the owner why the request was rejected' });
      return;
    }
    try {
      await api(`/admin/owner-requests/${id}/review`, {
        method: 'PATCH',
        body: { decision, note: note || undefined },
      });
      toast.success(decision === 'APPROVED' ? 'Owner approved' : 'Request rejected');
      router.push('/admin/owner-requests');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error || !request) return <p className="text-destructive">{error ?? 'Not found'}</p>;

  const rows: [string, string | null | undefined][] = [
    ['Account', `${request.user?.name} (${request.user?.email})`],
    ['Full name', request.fullName],
    ['NID / passport', request.nationalIdNumber],
    ['Phone', request.phone],
    ['Present address', request.address],
    ['Property address', request.propertyAddress],
    ['Notes', request.notes],
    ['Submitted', formatDate(request.submittedAt)],
    ['Review note', request.reviewNote],
  ];

  return (
    <>
      <PageHeader title="Owner request" description={request.fullName} actions={<StatusBadge status={request.status} />} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Applicant</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.documents?.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-accent"
              >
                <span>
                  <span className="font-medium">{DOCUMENT_TYPES.find((t) => t.value === d.type)?.label ?? d.type}</span>
                  <span className="block text-muted-foreground">{d.fileName}</span>
                </span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
            <p className="text-xs text-muted-foreground">Links are private and expire after 5 minutes.</p>
          </CardContent>
        </Card>
      </div>

      {request.status === 'PENDING' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note to owner (required when rejecting)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={() => review('APPROVED')} className="bg-emerald-600 hover:bg-emerald-700">
                    <Check /> Approve
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => review('REJECTED')}>
                    <X /> Reject
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
