'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous">
        <ChevronLeft />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="icon"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
