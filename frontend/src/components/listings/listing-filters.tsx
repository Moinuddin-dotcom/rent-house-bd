'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { DIVISIONS, PROPERTY_TYPES } from '@/lib/constants';
import type { ListingFilters as Filters } from '@/lib/validations/filters';

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export function ListingFilters({
  value,
  onChange,
  onReset,
}: {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}) {
  const num = (v: string) => (v === '' ? undefined : Number(v));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="q">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="q"
            className="pl-9"
            placeholder="Area, road, title…"
            value={value.q ?? ''}
            onChange={(e) => onChange({ q: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyType">Property type</Label>
        <NativeSelect
          id="propertyType"
          value={value.propertyType ?? ''}
          onChange={(e) => onChange({ propertyType: (e.target.value || undefined) as Filters['propertyType'] })}
        >
          <option value="">Any</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="division">Division</Label>
        <NativeSelect
          id="division"
          value={value.division ?? ''}
          onChange={(e) => onChange({ division: e.target.value || undefined })}
        >
          <option value="">All of Bangladesh</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">Area</Label>
        <Input
          id="area"
          placeholder="e.g. Mirpur, Dhanmondi"
          value={value.area ?? ''}
          onChange={(e) => onChange({ area: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>Monthly rent (৳)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            value={value.minRent ?? ''}
            onChange={(e) => onChange({ minRent: num(e.target.value) })}
          />
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            value={value.maxRent ?? ''}
            onChange={(e) => onChange({ maxRent: num(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={value.bedrooms === undefined ? 'default' : 'outline'}
            onClick={() => onChange({ bedrooms: undefined })}
          >
            Any
          </Button>
          {BEDROOM_OPTIONS.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={value.bedrooms === n ? 'default' : 'outline'}
              onClick={() => onChange({ bedrooms: n })}
            >
              {n}+
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" variant="ghost" className="w-full" onClick={onReset}>
        <RotateCcw /> Reset filters
      </Button>
    </div>
  );
}
