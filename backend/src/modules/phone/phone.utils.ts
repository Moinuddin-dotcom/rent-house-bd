/** Normalises Bangladeshi numbers so `+8801711…`, `8801711…` and `01711…` compare equal. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+880')) return `0${digits.slice(4)}`;
  if (digits.startsWith('880')) return `0${digits.slice(3)}`;
  return digits;
}
