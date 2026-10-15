import { z } from 'zod';
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS } from '@/lib/constants';

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const documentTypeEnum = z.enum([
  'NATIONAL_ID',
  'NATIONAL_ID_BACK',
  'SELFIE_WITH_NID',
  'PASSPORT',
  'OWNERSHIP_DEED',
  'MUTATION_KHATIAN',
  'DCR',
  'LAND_TAX_RECEIPT',
  'HOLDING_TAX_RECEIPT',
  'UTILITY_BILL',
  'WARISH_CERTIFICATE',
  'ALLOTMENT_LETTER',
  'POWER_OF_ATTORNEY',
  'OTHER',
]);

const documentFile = z
  .custom<File>((f) => typeof File !== 'undefined' && f instanceof File, 'Upload this document')
  .refine((f) => f.size <= MAX_SIZE, 'File must be 10 MB or smaller')
  .refine((f) => ACCEPTED.includes(f.type), 'Only JPG, PNG, WEBP or PDF');

export const verificationSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name').max(120),
    nationalIdNumber: z.string().regex(/^(\d{10}|\d{13}|\d{17})$/, 'NID number must be 10, 13 or 17 digits'),
    phone: z.string().regex(/^(\+?880|0)1[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
    addressDivision: z.string().min(1, 'Select a division'),
    addressDistrict: z.string().min(1, 'Select a district'),
    addressArea: z.string().trim().min(2, 'Select or type your area').max(80),
    addressZone: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'NON_RESIDENTIAL'], { message: 'Select the area type' }),
    addressZoneName: z.string().trim().min(2, 'Enter the area name, e.g. Kolpolok R/A').max(100),
    address: z.string().trim().min(5, 'Enter your building, floor and flat details').max(300),
    propertyDivision: z.string().min(1, 'Select a division'),
    propertyDistrict: z.string().min(1, 'Select a district'),
    propertyArea: z.string().trim().min(2, 'Select or type the area').max(80),
    propertyZone: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'NON_RESIDENTIAL'], { message: 'Select the area type' }),
    propertyZoneName: z.string().trim().min(2, 'Enter the area name, e.g. Kolpolok R/A').max(100),
    propertyAddress: z.string().trim().min(5, 'Enter the building, floor and flat details').max(300),
    ownershipType: z.enum(['SELF', 'INHERITED', 'DEVELOPER_PURCHASE', 'REPRESENTATIVE']),
    notes: z.string().max(1000).optional(),
    /** Named upload slots (required + recommended), keyed by document type. */
    documents: z.record(documentTypeEnum, documentFile.optional()),
    // Anything else (owner's NID when listing for them, building plan…). The API accepts 15 files in total.
    extraDocuments: z.array(z.object({ type: documentTypeEnum, file: documentFile })).max(5),
  })
  .superRefine((values, ctx) => {
    for (const type of REQUIRED_DOCUMENTS[values.ownershipType]) {
      if (!values.documents[type]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documents', type], message: 'This document is required' });
      }
    }
    for (const { value, imageOnly } of DOCUMENT_TYPES) {
      const file = values.documents[value];
      if (imageOnly && file && !file.type.startsWith('image/')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documents', value], message: 'Must be a photo (JPG, PNG or WEBP)' });
      }
    }
  });
export type VerificationValues = z.infer<typeof verificationSchema>;
