'use client';

import { Info } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const WIDTH = 272;
const MARGIN = 8;

/**
 * Small (i) icon that explains a field.
 * Mouse: opens on hover. Touch / pen / keyboard: toggles on tap or Enter; closes on outside tap or Escape.
 */
export function InfoTip({
  children,
  label = 'Why do we need this?',
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastPointer = useRef<string | null>(null);
  const id = useId();

  // Fixed positioning, clamped to the viewport so the bubble never runs off a phone screen
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, MARGIN),
      window.innerWidth - width - MARGIN,
    );
    setPosition({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  return (
    <span
      ref={wrapperRef}
      className={cn('inline-flex align-middle', className)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onClick={() => {
          // With a mouse, hover already controls it; a click shouldn't close it again
          if (lastPointer.current !== 'mouse') setOpen((o) => !o);
          lastPointer.current = null;
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-4 w-4" />
      </button>
      {open && position && (
        <span
          id={id}
          role="tooltip"
          style={{ top: position.top, left: position.left, width: Math.min(WIDTH, window.innerWidth - MARGIN * 2) }}
          className="fixed z-50 rounded-md bg-foreground px-3 py-2 text-left text-xs font-normal leading-relaxed text-background shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {children}
        </span>
      )}
    </span>
  );
}
