'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InfoTip } from '@/components/ui/info-tip';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { DOCUMENT_REASONS, DOCUMENT_TYPES, OWNERSHIP_TYPES, RECOMMENDED_DOCUMENTS, REQUIRED_DOCUMENTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { verificationSchema, type VerificationValues } from '@/lib/validations/owner';
import type { DocumentType } from '@/types';
import { LocationAddressFields } from './location-address-fields';
import { PhoneVerification, useIsPhoneVerified } from './phone-verification';

const ACCEPT_ANY = 'image/jpeg,image/png,image/webp,application/pdf';
const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp';

/** Why each field is asked for, shown in the (i) tooltips. */
const FIELD_REASONS = {
  fullName:
    'We match this name with your NID and ownership papers. It must be the same everywhere so we know you are the real owner.',
  nationalIdNumber:
    'Lets us confirm your identity against the NID images you upload. It is never shown to renters.',
  phone:
    'Renters will call or WhatsApp you on this number. Verifying it by SMS proves it is really yours and stops fake listings that use someone else’s number.',
  address: 'Helps us confirm who you are and reach you if there is a problem with your account. It is not shown publicly.',
  propertyAddress:
    'We check this against the address on your deed, khatian and utility bill to confirm the property really belongs to you.',
  ownershipType:
    'Ownership papers differ from case to case. Your answer decides which documents we need, so you only upload what applies to you.',
  requiredDocuments:
    'These documents prove who you are and that you have the right to rent out this property. They protect renters from fake listings and scams.',
  recommendedDocuments: 'Not required, but they give our reviewers more proof, so your request can be approved faster.',
  notes:
    'Explain anything unusual, such as a different spelling of your name on documents or joint ownership, so your request is not rejected by mistake.',
};

/** Form label followed by an (i) icon that explains why the field is needed. */
function LabelWithInfo({ children, info }: { children: React.ReactNode; info: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <FormLabel>{children}</FormLabel>
      <InfoTip>{info}</InfoTip>
    </div>
  );
}

/** Present-address field → matching property-address field, copied when "same address" is on. */
const ADDRESS_PAIRS = [
  ['addressDivision', 'propertyDivision'],
  ['addressDistrict', 'propertyDistrict'],
  ['addressArea', 'propertyArea'],
  ['addressZone', 'propertyZone'],
  ['addressZoneName', 'propertyZoneName'],
  ['address', 'propertyAddress'],
] as const;

export function VerificationForm({ defaults }: { defaults?: Partial<VerificationValues> }) {
  const router = useRouter();
  const { user, refresh } = useAuth();

  const form = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      fullName: defaults?.fullName ?? user?.name ?? '',
      nationalIdNumber: defaults?.nationalIdNumber ?? '',
      phone: defaults?.phone ?? user?.phone ?? '',
      addressDivision: defaults?.addressDivision ?? '',
      addressDistrict: defaults?.addressDistrict ?? '',
      addressArea: defaults?.addressArea ?? '',
      addressZone: defaults?.addressZone,
      addressZoneName: defaults?.addressZoneName ?? '',
      address: defaults?.address ?? '',
      propertyDivision: defaults?.propertyDivision ?? '',
      propertyDistrict: defaults?.propertyDistrict ?? '',
      propertyArea: defaults?.propertyArea ?? '',
      propertyZone: defaults?.propertyZone,
      propertyZoneName: defaults?.propertyZoneName ?? '',
      propertyAddress: defaults?.propertyAddress ?? '',
      ownershipType: defaults?.ownershipType ?? 'SELF',
      notes: defaults?.notes ?? '',
      documents: {},
      extraDocuments: [],
    },
  });
  const extraDocuments = useFieldArray({ control: form.control, name: 'extraDocuments' });
  const ownershipType = form.watch('ownershipType');
  const phone = form.watch('phone');
  const phoneVerified = useIsPhoneVerified(phone);

  // Resubmitting a request whose two addresses matched starts with the toggle on
  const [sameAddress, setSameAddress] = useState(
    () => !!defaults && ADDRESS_PAIRS.every(([from, to]) => !!defaults[from] && defaults[from] === defaults[to]),
  );

  // While on, keep the (hidden) property address in sync with the present address
  useEffect(() => {
    if (!sameAddress) return;
    const copy = () => {
      const values = form.getValues();
      for (const [from, to] of ADDRESS_PAIRS) {
        form.setValue(to, values[from] as never, { shouldValidate: form.formState.isSubmitted });
      }
    };
    copy();
    const subscription = form.watch((_, { name }) => {
      if (ADDRESS_PAIRS.some(([from]) => from === name)) copy();
    });
    return () => subscription.unsubscribe();
  }, [sameAddress, form]);

  const required = REQUIRED_DOCUMENTS[ownershipType];
  const recommended = RECOMMENDED_DOCUMENTS.filter((type) => !required.includes(type));

  const onSubmit = async (values: VerificationValues) => {
    if (!phoneVerified) {
      form.setError('phone', { message: 'Verify your phone number with the SMS code first' });
      return;
    }

    const data = new FormData();
    const { documents, extraDocuments: extras, ...fields } = values;
    Object.entries(fields).forEach(([key, value]) => value && data.append(key, value));
    // Only send slots that are shown for the chosen ownership type
    const docs = [...required, ...recommended]
      .filter((type) => documents[type])
      .map((type) => ({ type, file: documents[type]! }))
      .concat(extras);
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

  const text = (name: 'fullName' | 'nationalIdNumber', label: string, extra?: React.ComponentProps<'input'>) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <LabelWithInfo info={FIELD_REASONS[name]}>{label}</LabelWithInfo>
          <FormControl>
            <Input {...extra} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const documentSlot = (type: DocumentType, isRequired: boolean) => {
    const meta = DOCUMENT_TYPES.find((t) => t.value === type)!;
    return (
      <FormField
        key={type}
        control={form.control}
        name={`documents.${type}`}
        render={({ field: { onChange, value: _value, ...field } }) => (
          <FormItem className="rounded-lg border px-2 py-3 sm:p-3">
            <LabelWithInfo info={DOCUMENT_REASONS[type]}>
              {meta.label} {isRequired && <span className="text-destructive">*</span>}
            </LabelWithInfo>
            <FormControl>
              <Input
                type="file"
                accept={meta.imageOnly ? ACCEPT_IMAGES : ACCEPT_ANY}
                capture={type === 'SELFIE_WITH_NID' ? 'user' : undefined}
                onChange={(e) => onChange(e.target.files?.[0])}
                {...field}
              />
            </FormControl>
            <FormDescription>{meta.hint}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {text('fullName', 'Full name (as on NID)')}
          {text('nationalIdNumber', 'NID number', { inputMode: 'numeric', placeholder: '10, 13 or 17 digits' })}
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <LabelWithInfo info={FIELD_REASONS.phone}>Mobile number</LabelWithInfo>
              <FormControl>
                <Input type="tel" placeholder="01XXXXXXXXX" className="sm:max-w-xs" {...field} />
              </FormControl>
              <FormMessage />
              <PhoneVerification phone={field.value} />
            </FormItem>
          )}
        />

        <LocationAddressFields
          control={form.control}
          title="Your present address"
          info={FIELD_REASONS.address}
          names={{ division: 'addressDivision', district: 'addressDistrict', area: 'addressArea', zone: 'addressZone', zoneName: 'addressZoneName', details: 'address' }}
        >
          <label className="flex cursor-pointer items-start gap-3 rounded-md bg-muted/60 px-2 py-2 sm:px-3">
            <Switch
              className="mt-0.5"
              checked={sameAddress}
              onCheckedChange={setSameAddress}
              aria-describedby="same-address-hint"
            />
            <span className="text-sm">
              <span className="font-medium">The property I am listing is at this address</span>
              <span id="same-address-hint" className="block text-[0.8rem] text-muted-foreground">
                Turn this on if you live in the same building, flat or land. You won&apos;t need to fill in the property
                address separately.
              </span>
            </span>
          </label>
        </LocationAddressFields>

        {sameAddress ? (
          <p className="rounded-lg border border-dashed px-2 py-3 text-sm text-muted-foreground sm:px-3">
            <span className="font-medium text-foreground">Address of the building / flat / land:</span> same as your
            present address.
          </p>
        ) : (
          <LocationAddressFields
            control={form.control}
            title="Address of the building / flat / land"
            info={FIELD_REASONS.propertyAddress}
            names={{ division: 'propertyDivision', district: 'propertyDistrict', area: 'propertyArea', zone: 'propertyZone', zoneName: 'propertyZoneName', details: 'propertyAddress' }}
          />
        )}

        <FormField
          control={form.control}
          name="ownershipType"
          render={({ field }) => (
            <FormItem>
              <LabelWithInfo info={FIELD_REASONS.ownershipType}>How do you hold this property?</LabelWithInfo>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                {OWNERSHIP_TYPES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === option.value}
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      'rounded-lg border px-2 py-3 text-left text-sm sm:p-3 transition-colors hover:bg-accent',
                      field.value === option.value && 'border-primary bg-primary/5 ring-1 ring-primary',
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="block text-[0.8rem] text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">Required documents</p>
              <InfoTip>{FIELD_REASONS.requiredDocuments}</InfoTip>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              JPG, PNG, WEBP or PDF up to 10 MB each. Documents are private and only seen by our review team.
            </p>
          </div>
          {required.map((type) => documentSlot(type, true))}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">Recommended (optional)</p>
              <InfoTip>{FIELD_REASONS.recommendedDocuments}</InfoTip>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">These help us approve your request faster.</p>
          </div>
          {recommended.map((type) => documentSlot(type, false))}

          {extraDocuments.fields.map((doc, index) => (
            <div key={doc.id} className="grid items-start gap-2 rounded-lg border px-2 py-3 sm:grid-cols-[220px_1fr_auto] sm:p-3">
              <FormField
                control={form.control}
                name={`extraDocuments.${index}.type`}
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
                name={`extraDocuments.${index}.file`}
                render={({ field: { onChange, value: _value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="file" accept={ACCEPT_ANY} onChange={(e) => onChange(e.target.files?.[0])} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => extraDocuments.remove(index)} aria-label="Remove document">
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => extraDocuments.append({ type: 'OTHER', file: undefined as unknown as File })}
            disabled={extraDocuments.fields.length >= 5}
          >
            <Plus /> Add another document
          </Button>
          {ownershipType === 'REPRESENTATIVE' && (
            <p className="text-[0.8rem] text-muted-foreground">
              Listing for someone else? Please also add the owner&apos;s NID as an extra document.
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <LabelWithInfo info={FIELD_REASONS.notes}>Notes for the reviewer (optional)</LabelWithInfo>
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
