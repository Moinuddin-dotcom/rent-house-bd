'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { DOCUMENT_TYPES } from '@/lib/constants';
import { verificationSchema, type VerificationValues } from '@/lib/validations/owner';

export function VerificationForm({ defaults }: { defaults?: Partial<VerificationValues> }) {
  const router = useRouter();
  const { user, refresh } = useAuth();

  const form = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      fullName: defaults?.fullName ?? user?.name ?? '',
      nationalIdNumber: defaults?.nationalIdNumber ?? '',
      phone: defaults?.phone ?? user?.phone ?? '',
      address: defaults?.address ?? '',
      propertyAddress: defaults?.propertyAddress ?? '',
      notes: defaults?.notes ?? '',
      documents: [],
    },
  });
  const documents = useFieldArray({ control: form.control, name: 'documents' });

  const onSubmit = async (values: VerificationValues) => {
    const data = new FormData();
    const { documents: docs, ...fields } = values;
    Object.entries(fields).forEach(([key, value]) => value && data.append(key, value));
    data.append('documentTypes', JSON.stringify(docs.map((d) => d.type)));
    docs.forEach((d) => data.append('documents', d.file));

    try {
      await api('/owners/verification', { method: 'POST', body: data });
      await refresh();
      toast.success('Submitted! We will review your documents shortly.');
      router.push('/owner/dashboard');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const text = (name: 'fullName' | 'nationalIdNumber' | 'phone', label: string, extra?: React.ComponentProps<'input'>) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...extra} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {text('fullName', 'Full name (as on NID)')}
          {text('nationalIdNumber', 'NID / passport number')}
          {text('phone', 'Phone number', { type: 'tel', placeholder: '01XXXXXXXXX' })}
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your present address</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="propertyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address of the building / flat / land you own</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Supporting documents</p>
            <p className="text-[0.8rem] text-muted-foreground">
              Upload your NID or passport and proof that you own the property (deed, land tax receipt, utility bill…).
              JPG, PNG, WEBP or PDF up to 10 MB. Documents are private and only seen by our review team.
            </p>
          </div>
          {documents.fields.map((doc, index) => (
            <div key={doc.id} className="grid items-start gap-2 rounded-lg border p-3 sm:grid-cols-[200px_1fr_auto]">
              <FormField
                control={form.control}
                name={`documents.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <NativeSelect {...field}>
                        {DOCUMENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`documents.${index}.file`}
                render={({ field: { onChange, value: _value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => onChange(e.target.files?.[0])}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => documents.remove(index)} aria-label="Remove document">
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              documents.append({
                type: documents.fields.length === 0 ? 'NATIONAL_ID' : 'OWNERSHIP_DEED',
                file: undefined as unknown as File,
              })
            }
            disabled={documents.fields.length >= 10}
          >
            <Plus /> Add document
          </Button>
          {form.formState.errors.documents?.root?.message || form.formState.errors.documents?.message ? (
            <p className="text-[0.8rem] font-medium text-destructive">
              {form.formState.errors.documents?.root?.message ?? form.formState.errors.documents?.message}
            </p>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes for the reviewer (optional)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormDescription>Anything that helps us verify ownership faster.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          <FileUp /> {form.formState.isSubmitting ? 'Uploading…' : 'Submit for review'}
        </Button>
      </form>
    </Form>
  );
}
