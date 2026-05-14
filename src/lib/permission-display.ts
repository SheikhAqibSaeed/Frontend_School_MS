export type PermissionRowInput = {
  id: string;
  code: string;
  module: string;
  description?: string | null;
};

export type GroupedPermission = PermissionRowInput & {
  moduleKey: string;
  moduleLabel: string;
  actionKey: string;
  actionLabel: string;
};

const ACTION_ORDER = ['create', 'read', 'update', 'delete'] as const;

function actionSortKey(actionKey: string): number {
  const i = ACTION_ORDER.indexOf(actionKey.toLowerCase() as (typeof ACTION_ORDER)[number]);
  return i >= 0 ? i : 99;
}

/** Turn slug segments into Title Case (e.g. `fee_structure` → `Fee Structure`). */
export function formatModuleLabel(slug: string): string {
  if (!slug.trim()) return 'Other';
  return slug
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Create',
  read: 'Read',
  update: 'Update',
  delete: 'Delete',
};

export function extractModuleFromCode(code: string): string {
  const dot = code.indexOf('.');
  return dot >= 0 ? code.slice(0, dot).toLowerCase() : 'other';
}

export function extractActionFromCode(code: string): string {
  const dot = code.lastIndexOf('.');
  return dot >= 0 ? code.slice(dot + 1) : code;
}

export function formatActionLabel(actionKey: string): string {
  const k = actionKey.toLowerCase();
  if (ACTION_LABELS[k]) return ACTION_LABELS[k];
  return formatModuleLabel(actionKey.replace(/\./g, '_'));
}

export function groupPermissionRows(rows: PermissionRowInput[]): {
  moduleKey: string;
  moduleLabel: string;
  items: GroupedPermission[];
}[] {
  const map = new Map<string, PermissionRowInput[]>();
  for (const p of rows) {
    const key = (p.module && p.module.trim() ? p.module.trim() : extractModuleFromCode(p.code)).toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }

  const groups = [...map.entries()].map(([moduleKey, list]) => {
    const items: GroupedPermission[] = list.map((p) => {
      const actionKey = extractActionFromCode(p.code);
      return {
        ...p,
        moduleKey,
        moduleLabel: formatModuleLabel(moduleKey),
        actionKey,
        actionLabel: formatActionLabel(actionKey),
      };
    });
    items.sort((a, b) => {
      const oa = actionSortKey(a.actionKey);
      const ob = actionSortKey(b.actionKey);
      if (oa !== ob) return oa - ob;
      return a.actionLabel.localeCompare(b.actionLabel);
    });
    return {
      moduleKey,
      moduleLabel: formatModuleLabel(moduleKey),
      items,
    };
  });

  groups.sort((a, b) => a.moduleLabel.localeCompare(b.moduleLabel));
  return groups;
}

export const CRUD_COLUMN_ORDER = ['create', 'read', 'update', 'delete'] as const;
export type CrudColumnKey = (typeof CRUD_COLUMN_ORDER)[number];

export function toGroupedPermissionRow(p: PermissionRowInput): GroupedPermission {
  const moduleKey = (p.module && p.module.trim() ? p.module.trim() : extractModuleFromCode(p.code)).toLowerCase();
  const actionKey = extractActionFromCode(p.code);
  return {
    ...p,
    moduleKey,
    moduleLabel: formatModuleLabel(moduleKey),
    actionKey,
    actionLabel: formatActionLabel(actionKey),
  };
}

export type CrudActionColumn = {
  key: CrudColumnKey | 'other';
  label: string;
  items: GroupedPermission[];
};

/** Group flat permission rows into Create / Read / Update / Delete columns (+ Other if needed). */
export function groupPermissionsByCrudColumns(rows: PermissionRowInput[]): CrudActionColumn[] {
  const buckets: Record<CrudColumnKey | 'other', GroupedPermission[]> = {
    create: [],
    read: [],
    update: [],
    delete: [],
    other: [],
  };
  for (const p of rows) {
    const g = toGroupedPermissionRow(p);
    const ak = g.actionKey.toLowerCase();
    const bucketKey = (CRUD_COLUMN_ORDER as readonly string[]).includes(ak) ? (ak as CrudColumnKey) : 'other';
    buckets[bucketKey].push(g);
  }
  for (const k of [...CRUD_COLUMN_ORDER, 'other'] as const) {
    buckets[k].sort((a, b) => a.moduleLabel.localeCompare(b.moduleLabel) || a.code.localeCompare(b.code));
  }
  const cols: CrudActionColumn[] = CRUD_COLUMN_ORDER.map((key) => ({
    key,
    label: formatActionLabel(key),
    items: buckets[key],
  }));
  if (buckets.other.length > 0) {
    cols.push({ key: 'other', label: 'Other', items: buckets.other });
  }
  return cols;
}
