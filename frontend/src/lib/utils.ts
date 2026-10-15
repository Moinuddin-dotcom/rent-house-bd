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

export function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}
