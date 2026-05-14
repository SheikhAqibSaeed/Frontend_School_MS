'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { groupPermissionRows, type PermissionRowInput } from '@/lib/permission-display';

type CatalogProps = {
  variant: 'catalog';
  permissions: PermissionRowInput[];
};

type EditorProps = {
  variant: 'editor';
  permissions: PermissionRowInput[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

type Props = CatalogProps | EditorProps;

export function PermissionGroupsPanel(props: Props) {
  const groups = useMemo(() => groupPermissionRows(props.permissions), [props.permissions]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {groups.map((g) => (
        <section
          key={g.moduleKey}
          className="overflow-hidden rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
        >
          <header className="flex flex-col gap-0.5 border-b border-border/60 bg-gradient-to-r from-muted/50 to-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold tracking-tight">{g.moduleLabel}</h3>
            <p className="text-xs text-muted-foreground sm:text-right">
              {g.items.length} {g.items.length === 1 ? 'permission' : 'permissions'}
            </p>
          </header>
          <div className="px-4 py-4">
            {props.variant === 'catalog' ? (
              <div className="flex flex-wrap gap-2">
                {g.items.map((p) => (
                  <Badge
                    key={p.id}
                    variant="secondary"
                    className="font-normal"
                    title={p.code}
                  >
                    {p.actionLabel}
                  </Badge>
                ))}
              </div>
            ) : (
              <div
                role="group"
                aria-label={`${g.moduleLabel} permissions`}
                className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {g.items.map((p) => {
                  const on = props.selected.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        on
                          ? 'border-primary/40 bg-primary/[0.06] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]'
                          : 'border-border/80 bg-background hover:bg-muted/50',
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        checked={on}
                        onChange={() => props.onToggle(p.id)}
                      />
                      <span className="min-w-0 font-medium leading-none">{p.actionLabel}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
