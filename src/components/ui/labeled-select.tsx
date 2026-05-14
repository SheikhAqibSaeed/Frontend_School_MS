'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type LabeledSelectOption = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: LabeledSelectOption[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
};

/** Native `<select>` with label — for legacy forms; use Radix `select.tsx` for new ShadCN flows. */
export function LabeledSelect({ label, value, onChange, options, className, disabled, required, id }: Props) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      >
        {options.map((o) => (
          <option key={o.value === '' ? '__empty__' : o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
