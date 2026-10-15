import { z } from 'zod';

const phone = z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number');
const optionalInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
  z.number().int().min(0).optional(),
);
const optionalCoord = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
    z.number().min(min).max(max).optional(),
  );

export const listingSchema = z.object({
  title: z.string().min(5, 'Title is too short').max(120),
  description: z.string().min(20, 'Describe the property in at least 20 characters').max(5000),
  propertyType: z.enum(['FLAT', 'HOUSE', 'ROOM', 'SUBLET']),
  rentAmount: z.coerce.number({ invalid_type_error: 'Enter the monthly rent' }).int().min(0),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  areaSqft: optionalInt,
  floor: optionalInt,
  furnished: z.boolean().default(false),
  availableFrom: z.string().optional(),
  division: z.string().min(2, 'Select a division'),
  district: z.string().min(2, 'Enter the district'),
  area: z.string().min(2, 'Enter the area / locality'),
  address: z.string().min(5, 'Enter the full address').max(300),
  latitude: optionalCoord(-90, 90),
  longitude: optionalCoord(-180, 180),
  phoneNumbers: z
    .array(z.object({ value: phone }))
    .min(1, 'Add at least one phone number')
    .max(4, 'Up to 4 phone numbers'),
  whatsappNumber: phone,
  contactEmail: z.string().email('Enter a valid email'),
});

export type ListingFormInput = z.input<typeof listingSchema>;
export type ListingFormValues = z.output<typeof listingSchema>;

/** Convert form values to the API payload shape. */
export function toListingPayload(values: ListingFormValues) {
  return {
    ...values,
    phoneNumbers: values.phoneNumbers.map((p) => p.value),
    availableFrom: values.availableFrom ? new Date(values.availableFrom).toISOString() : undefined,
  };
}
