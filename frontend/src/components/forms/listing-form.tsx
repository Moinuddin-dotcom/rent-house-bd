'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { DIVISIONS, PROPERTY_TYPES } from '@/lib/constants';
import { listingSchema, type ListingFormInput, type ListingFormValues } from '@/lib/validations/listing';

const LocationPicker = dynamic(() => import('./location-picker'), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

export const EMPTY_LISTING: ListingFormInput = {
  title: '',
  description: '',
  propertyType: 'FLAT',
  rentAmount: '' as unknown as number,
  bedrooms: 2,
  bathrooms: 1,
  areaSqft: undefined,
  floor: undefined,
  furnished: false,
  availableFrom: '',
  division: 'Dhaka',
  district: '',
  area: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  phoneNumbers: [{ value: '' }],
  whatsappNumber: '',
  contactEmail: '',
};

export function ListingForm({
  defaultValues = EMPTY_LISTING,
  submitLabel,
  onSubmit,
}: {
  defaultValues?: ListingFormInput;
  submitLabel: string;
  onSubmit: (values: ListingFormValues) => Promise<void>;
}) {
  const form = useForm<ListingFormInput, unknown, ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });
  const phones = useFieldArray({ control: form.control, name: 'phoneNumbers' });
  const [lat, lng] = form.watch(['latitude', 'longitude']);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3 bed family flat near Dhanmondi Lake" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="Facilities, nearby schools/markets, rules, utilities…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <NumberField f={form} name="rentAmount" label="Monthly rent (৳)" />
              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available from</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <NumberField f={form} name="bedrooms" label="Bedrooms" />
              <NumberField f={form} name="bathrooms" label="Bathrooms" />
              <NumberField f={form} name="areaSqft" label="Size (sqft)" />
              <NumberField f={form} name="floor" label="Floor" />
              <FormField
                control={form.control}
                name="furnished"
                render={({ field }) => (
                  <FormItem className="flex items-end gap-2 space-y-0 pb-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>Furnished</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Click on the map to pin your property so renters can find it in map search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {DIVISIONS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <TextField f={form} name="district" label="District" placeholder="e.g. Dhaka" />
              <TextField f={form} name="area" label="Area" placeholder="e.g. Mirpur 10" />
            </div>
            <TextField f={form} name="address" label="Full address" placeholder="House, road, block" />
            <LocationPicker
              latitude={lat as number | undefined}
              longitude={lng as number | undefined}
              onPick={(la, lo) => {
                form.setValue('latitude', la, { shouldDirty: true });
                form.setValue('longitude', lo, { shouldDirty: true });
              }}
            />
            {lat != null && lng != null && (
              <p className="text-xs text-muted-foreground">
                Pinned at {String(lat)}, {String(lng)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>Only shown to registered renters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Phone numbers (up to 4)</p>
              {phones.fields.map((p, index) => (
                <FormField
                  key={p.id}
                  control={form.control}
                  name={`phoneNumbers.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="tel" placeholder="01XXXXXXXXX" {...field} />
                        </FormControl>
                        {phones.fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => phones.remove(index)} aria-label="Remove phone">
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {phones.fields.length < 4 && (
                <Button type="button" variant="outline" size="sm" onClick={() => phones.append({ value: '' })}>
                  <Plus /> Add phone
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField f={form} name="whatsappNumber" label="WhatsApp number" placeholder="01XXXXXXXXX" type="tel" />
              <TextField f={form} name="contactEmail" label="Contact email" type="email" />
            </div>
            <FormDescription>Rental listings are always free to post.</FormDescription>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

type ListingFormApi = ReturnType<typeof useForm<ListingFormInput, unknown, ListingFormValues>>;

function TextField({
  f,
  name,
  label,
  ...rest
}: {
  f: ListingFormApi;
  name: 'district' | 'area' | 'address' | 'whatsappNumber' | 'contactEmail';
  label: string;
} & React.ComponentProps<'input'>) {
  return (
    <FormField
      control={f.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...rest} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberField({
  f,
  name,
  label,
}: {
  f: ListingFormApi;
  name: 'rentAmount' | 'bedrooms' | 'bathrooms' | 'areaSqft' | 'floor';
  label: string;
}) {
  return (
    <FormField
      control={f.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              {...field}
              value={(field.value as number | string | undefined) ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
