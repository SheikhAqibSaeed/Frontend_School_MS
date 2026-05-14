'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { groupPermissionsByCrudColumns, type PermissionRowInput } from '@/lib/permission-display';

type Props = {
  permissions: PermissionRowInput[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  /** Select or clear many permission ids at once (used by column / global "select all"). */
  onSetMany: (ids: string[], checked: boolean) => void;
};

function ColumnSelectAllCheckbox({
  ids,
  selected,
  onSetMany,
}: {
  ids: string[];
  selected: Set<string>;
  onSetMany: (ids: string[], checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = ids.some((id) => selected.has(id));
  const indeterminate = someSelected && !allSelected;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  if (ids.length === 0) return null;

  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
      <input
        ref={ref}
        type="checkbox"
        className="h-3.5 w-3.5 shrink-0 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        checked={allSelected}
        onChange={(e) => onSetMany(ids, e.target.checked)}
      />
      <span>Select all</span>
    </label>
  );
}

export function PermissionActionMatrix({ permissions, selected, onToggle, onSetMany }: Props) {
  const columns = useMemo(() => groupPermissionsByCrudColumns(permissions), [permissions]);
  const allIds = useMemo(() => permissions.map((p) => p.id), [permissions]);
  const globalRef = useRef<HTMLInputElement>(null);
  const allGlobalSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someGlobalSelected = allIds.some((id) => selected.has(id));
  const globalIndeterminate = someGlobalSelected && !allGlobalSelected;

  useEffect(() => {
    if (globalRef.current) globalRef.current.indeterminate = globalIndeterminate;
  }, [globalIndeterminate]);

  return (
    <div className="space-y-4">
      {allIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/25 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              ref={globalRef}
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              checked={allGlobalSelected}
              onChange={(e) => onSetMany(allIds, e.target.checked)}
            />
            <span>Select all permissions</span>
          </label>
          <p className="text-xs text-muted-foreground">
            {selected.size} of {allIds.length} selected
          </p>
        </div>
      )}

      <div
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(14rem,1fr))]"
        role="group"
        aria-label="Permissions by action"
      >
        {columns.map((col) => {
          const colIds = col.items.map((p) => p.id);
          return (
            <Card
              key={col.key}
              className="flex min-h-0 flex-col overflow-hidden border-border/80 bg-card shadow-sm"
            >
              <CardHeader className="shrink-0 space-y-2 border-b bg-muted/30 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold tracking-tight">{col.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{col.items.length} items</p>
                  </div>
                  <ColumnSelectAllCheckbox ids={colIds} selected={selected} onSetMany={onSetMany} />
                </div>
              </CardHeader>
              <CardContent className="max-h-[min(70vh,52rem)] flex-1 space-y-0 overflow-y-auto overscroll-contain p-3 pt-3">
                {col.items.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">None</p>
                ) : (
                  <ul className="space-y-1">
                    {col.items.map((p) => {
                      const on = selected.has(p.id);
                      return (
                        <li key={p.id}>
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-2.5 rounded-md border px-2.5 py-2 text-sm transition-colors',
                              on
                                ? 'border-primary/35 bg-primary/[0.07]'
                                : 'border-transparent hover:bg-muted/60',
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              checked={on}
                              onChange={() => onToggle(p.id)}
                              title={p.code}
                            />
                            <span className="min-w-0 font-medium leading-snug text-foreground">{p.moduleLabel}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
