import { z } from 'zod';

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const verificationSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name').max(120),
  nationalIdNumber: z.string().min(5, 'Enter a valid NID / passport number').max(30),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter your present address').max(300),
  propertyAddress: z.string().min(5, 'Enter the property address').max(300),
  notes: z.string().max(1000).optional(),
  documents: z
    .array(
      z.object({
        type: z.enum(['NATIONAL_ID', 'PASSPORT', 'OWNERSHIP_DEED', 'LAND_TAX_RECEIPT', 'UTILITY_BILL', 'OTHER']),
        file: z
          .custom<File>((f) => typeof File !== 'undefined' && f instanceof File, 'Choose a file')
          .refine((f) => f.size <= MAX_SIZE, 'File must be 10 MB or smaller')
          .refine((f) => ACCEPTED.includes(f.type), 'Only JPG, PNG, WEBP or PDF'),
      }),
    )
    .min(2, 'Upload your ID and at least one proof of ownership')
    .max(10),
});
export type VerificationValues = z.infer<typeof verificationSchema>;
