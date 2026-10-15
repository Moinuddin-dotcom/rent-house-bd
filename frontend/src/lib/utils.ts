import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat('en-BD').format(amount)}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

/** Same rule as the API: `+8801711…`, `8801711…` and `01711…` are one number. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+880')) return `0${digits.slice(4)}`;
  if (digits.startsWith('880')) return `0${digits.slice(3)}`;
  return digits;
}

export function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}
