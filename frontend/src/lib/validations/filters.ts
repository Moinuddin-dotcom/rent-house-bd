import { z } from 'zod';

/** Search filters, parsed from / serialised to the URL query string. */
export const listingFiltersSchema = z.object({
  q: z.string().optional(),
  propertyType: z.enum(['FLAT', 'HOUSE', 'ROOM', 'SUBLET']).optional().catch(undefined),
  division: z.string().optional(),
  district: z.string().optional(),
  area: z.string().optional(),
  minRent: z.coerce.number().int().min(0).optional().catch(undefined),
  maxRent: z.coerce.number().int().min(0).optional().catch(undefined),
  bedrooms: z.coerce.number().int().min(0).optional().catch(undefined),
  sort: z.enum(['newest', 'rent_asc', 'rent_desc']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;

export function parseFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): ListingFilters {
  const entries =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const cleaned = Object.fromEntries(Object.entries(entries).filter(([, v]) => v !== undefined && v !== ''));
  return listingFiltersSchema.parse(cleaned);
}
