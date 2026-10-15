import { z } from 'zod';

/** Shown as a live checklist under the password field. Mirrors PASSWORD_PATTERN in the API's register.dto.ts. */
export const PASSWORD_RULES = [
  { label: 'At least 4 letters (e.g. Abcd)', test: (v: string) => (v.match(/[A-Za-z]/g)?.length ?? 0) >= 4 },
  { label: 'At least 2 numbers (e.g. 12)', test: (v: string) => (v.match(/\d/g)?.length ?? 0) >= 2 },
  { label: 'At least 1 special character (e.g. @ or #)', test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
];

const password = z
  .string()
  .max(72, 'At most 72 characters')
  .superRefine((value, ctx) => {
    const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
    if (failed) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Password needs: ${failed.label.toLowerCase()}` });
  });

const phone = z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is too short').max(100),
    email: z.string().email('Enter a valid email'),
    phone: phone.optional().or(z.literal('')),
    password,
    confirmPassword: z.string(),
    accountType: z.enum(['RENTER', 'OWNER']),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterValues = z.infer<typeof registerSchema>;
