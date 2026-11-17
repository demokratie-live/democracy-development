import React, { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  labelId: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

const summary = (value: string[]) =>
  value.length === 0 ? 'Alle' : value.length === 1 ? value[0] : `${value.length} Stände`;

/** Several statuses at once; a native <details>, so no popover dependency is needed. */
export const StatusFilter: React.FC<Props> = ({ labelId, options, value, onChange }) => {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !ref.current?.open) return;
      ref.current.open = false;
      ref.current.querySelector('summary')?.focus();
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const toggle = (status: string, checked: boolean) =>
    onChange(checked ? [...value, status] : value.filter((s) => s !== status));

  return (
    <details ref={ref} className="group relative">
      <summary
        aria-labelledby={`${labelId} ${labelId}-value`}
        className="flex h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-md border border-input bg-background pr-2.5 pl-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
      >
        <span id={`${labelId}-value`} className="truncate">
          {summary(value)}
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <fieldset className="absolute right-0 z-20 mt-1 max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
        <legend className="sr-only">Stand</legend>
        {options.length === 0 && <p className="px-2 py-1.5 text-sm text-muted-foreground">Keine Stände geladen.</p>}
        {options.map((status) => (
          <label
            key={status}
            className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
          >
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-primary"
              checked={value.includes(status)}
              onChange={(e) => toggle(status, e.target.checked)}
            />
            {status}
          </label>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            className="mt-1 w-full rounded border-t px-2 py-1.5 text-left text-sm text-primary hover:bg-accent"
            onClick={() => onChange([])}
          >
            Auswahl aufheben
          </button>
        )}
      </fieldset>
    </details>
  );
};
