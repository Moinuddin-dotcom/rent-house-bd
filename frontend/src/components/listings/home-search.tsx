'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { buildQuery } from '@/lib/api-client';
import { DIVISIONS } from '@/lib/constants';

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [division, setDivision] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  return (
    <form
      className="grid gap-2 rounded-xl bg-background p-3 shadow-lg sm:grid-cols-[1fr_160px_130px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/listings${buildQuery({ q, division, bedrooms })}`);
      }}
    >
      <Input placeholder="Where do you want to live? e.g. Mirpur" value={q} onChange={(e) => setQ(e.target.value)} />
      <NativeSelect value={division} onChange={(e) => setDivision(e.target.value)} aria-label="Division">
        <option value="">Any division</option>
        {DIVISIONS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </NativeSelect>
      <NativeSelect value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} aria-label="Bedrooms">
        <option value="">Any beds</option>
        {[1, 2, 3, 4].map((n) => (
          <option key={n} value={n}>
            {n}+ beds
          </option>
        ))}
      </NativeSelect>
      <Button type="submit">
        <Search /> Search
      </Button>
    </form>
  );
}
