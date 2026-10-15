import { z } from 'zod';

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
    password: z.string().min(8, 'At least 8 characters').max(72),
    confirmPassword: z.string(),
    accountType: z.enum(['RENTER', 'OWNER']),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
export type RegisterValues = z.infer<typeof registerSchema>;
