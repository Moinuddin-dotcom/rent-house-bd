'use client';

import { useState } from 'react';
import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { InfoTip } from '@/components/ui/info-tip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { BD_LOCATIONS } from '@/lib/bd-locations';
import { ZONE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const OTHER_AREA = '__other__';

interface LocationAddressFieldsProps<T extends FieldValues> {
  control: Control<T>;
  /** Group heading, e.g. "Your present address" */
  title: string;
  info: string;
  /** Extra content at the bottom of the section (e.g. a toggle) */
  children?: React.ReactNode;
  names: {
    division: FieldPath<T>;
    district: FieldPath<T>;
    area: FieldPath<T>;
    zone: FieldPath<T>;
    zoneName: FieldPath<T>;
    details: FieldPath<T>;
  };
}

/** Division → district → area pickers, the area (zone) type and its name, then building / floor / flat details. */
export function LocationAddressFields<T extends FieldValues>({ control, title, info, names, children }: LocationAddressFieldsProps<T>) {
  const division = useController({ control, name: names.division });
  const district = useController({ control, name: names.district });
  const area = useController({ control, name: names.area });
  const zone = useController({ control, name: names.zone });
  const zoneName = useController({ control, name: names.zoneName });
  const selectedZone = ZONE_TYPES.find((z) => z.value === zone.field.value);
  const details = useController({ control, name: names.details });

  const districts = BD_LOCATIONS.find((d) => d.name === division.field.value)?.districts ?? [];
  const areas = districts.find((d) => d.name === district.field.value)?.areas ?? [];
  // An area that isn't in our list (e.g. loaded from an earlier request) is shown as typed text
  const [customArea, setCustomArea] = useState(() => !!area.field.value && !areas.includes(area.field.value));

  const ids = { division: `${names.division}-select`, district: `${names.district}-select`, area: `${names.area}-select`, details: `${names.details}-input` };

  const select = (
    id: string,
    label: string,
    error: string | undefined,
    input: React.ReactNode,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={cn('text-xs', error && 'text-destructive')}>
        {label}
      </Label>
      {input}
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  );

  return (
    <fieldset className="space-y-3 rounded-lg border px-2 py-3 sm:p-3">
      <legend className="flex items-center gap-1.5 px-1 text-sm font-medium">
        {title}
        <InfoTip>{info}</InfoTip>
      </legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {select(
          ids.division,
          'Division',
          division.fieldState.error?.message,
          <NativeSelect
            id={ids.division}
            ref={division.field.ref}
            name={division.field.name}
            value={division.field.value ?? ''}
            onBlur={division.field.onBlur}
            onChange={(e) => {
              division.field.onChange(e.target.value);
              district.field.onChange('');
              area.field.onChange('');
              setCustomArea(false);
            }}
          >
            <option value="">Select division</option>
            {BD_LOCATIONS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </NativeSelect>,
        )}

        {select(
          ids.district,
          'District',
          district.fieldState.error?.message,
          <NativeSelect
            id={ids.district}
            ref={district.field.ref}
            name={district.field.name}
            value={district.field.value ?? ''}
            onBlur={district.field.onBlur}
            disabled={!division.field.value}
            onChange={(e) => {
              district.field.onChange(e.target.value);
              area.field.onChange('');
              setCustomArea(false);
            }}
          >
            <option value="">{division.field.value ? 'Select district' : 'Select division first'}</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </NativeSelect>,
        )}

        {select(
          ids.area,
          'Area / Thana / Upazila',
          area.fieldState.error?.message,
          <>
            <NativeSelect
              id={ids.area}
              ref={customArea ? undefined : area.field.ref}
              value={customArea ? OTHER_AREA : (area.field.value ?? '')}
              onBlur={area.field.onBlur}
              disabled={!district.field.value}
              onChange={(e) => {
                const other = e.target.value === OTHER_AREA;
                setCustomArea(other);
                area.field.onChange(other ? '' : e.target.value);
              }}
            >
              <option value="">{district.field.value ? 'Select area' : 'Select district first'}</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value={OTHER_AREA}>Other (not listed)</option>
            </NativeSelect>
            {customArea && (
              <Input
                ref={area.field.ref}
                className="mt-2"
                placeholder="Type your area"
                aria-label="Area name"
                value={area.field.value ?? ''}
                onChange={(e) => area.field.onChange(e.target.value)}
                onBlur={area.field.onBlur}
              />
            )}
          </>,
        )}
      </div>

      <div className="space-y-1.5">
        <p id={`${names.zone}-label`} className={cn('text-xs font-medium', zone.fieldState.error && 'text-destructive')}>
          Area type
        </p>
        <div role="radiogroup" aria-labelledby={`${names.zone}-label`} className="grid gap-2 sm:grid-cols-3">
          {ZONE_TYPES.map((option, index) => {
            const selected = zone.field.value === option.value;
            return (
              <button
                key={option.value}
                ref={index === 0 ? zone.field.ref : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => zone.field.onChange(option.value)}
                onBlur={zone.field.onBlur}
                className={cn(
                  'rounded-md border px-2 py-2 text-left text-sm transition-colors hover:bg-accent sm:px-3',
                  selected && 'border-primary bg-primary/5 ring-1 ring-primary',
                )}
              >
                <span className="font-medium">{option.label}</span>
                <span className="block text-[0.75rem] text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>
        {zone.fieldState.error && (
          <p className="text-[0.8rem] font-medium text-destructive">{zone.fieldState.error.message}</p>
        )}
      </div>

      {selectedZone && (
        <div className="space-y-1.5">
          <Label htmlFor={`${names.zoneName}-input`} className={cn('text-xs', zoneName.fieldState.error && 'text-destructive')}>
            {selectedZone.label} name
          </Label>
          <Input
            id={`${names.zoneName}-input`}
            placeholder={`e.g. ${selectedZone.example}`}
            {...zoneName.field}
            value={zoneName.field.value ?? ''}
          />
          {zoneName.fieldState.error && (
            <p className="text-[0.8rem] font-medium text-destructive">{zoneName.fieldState.error.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={ids.details} className={cn('text-xs', details.fieldState.error && 'text-destructive')}>
          House / building details
        </Label>
        <Textarea
          id={ids.details}
          rows={3}
          placeholder="e.g. Green View Tower, Flat 4B (4th floor), House 12, Road 5, Block C, Plot 7, Section 10"
          {...details.field}
          value={details.field.value ?? ''}
        />
        <p className="text-[0.8rem] text-muted-foreground">
          Building name, floor number, flat name or number, house / plot number, road and block.
        </p>
        {details.fieldState.error && (
          <p className="text-[0.8rem] font-medium text-destructive">{details.fieldState.error.message}</p>
        )}
      </div>
      {children}
    </fieldset>
  );
}
