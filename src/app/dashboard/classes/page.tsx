'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BookOpen,
  Edit,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import {
  createClass,
  deleteClass,
  listClasses,
  listSections,
  updateClass,
} from '@/services/api/academics.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LabeledSelect } from '@/components/ui/labeled-select';

type ClassRow = Record<string, unknown>;

function StatCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ClassRow | null>(null);
  const [editing, setEditing] = useState<ClassRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    level: '',
    capacity: '40',
    isActive: 'true',
  });

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses({ limit: 100 }),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'class-counts'],
    queryFn: () => listSections({ limit: 100 }),
  });

  const sectionCountByClass = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sectionsData?.items ?? []) {
      const classId = String(s.classId ?? (s.class as { id?: string } | undefined)?.id ?? '');
      if (classId) map.set(classId, (map.get(classId) ?? 0) + 1);
    }
    return map;
  }, [sectionsData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const capacity = form.capacity.trim() ? Number(form.capacity) : undefined;
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        level: form.level.trim() || undefined,
        capacity: capacity != null && !Number.isNaN(capacity) ? capacity : undefined,
        isActive: form.isActive === 'true',
      };
      if (editing?.id) return updateClass(String(editing.id), body);
      return createClass(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Class updated' : 'Class created');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: Error & { apiMessage?: string }) =>
      toast.error(e.apiMessage ?? e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      toast.success('Class deactivated');
      setConfirmDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: Error & { apiMessage?: string }) =>
      toast.error(e.apiMessage ?? e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', level: '', capacity: '40', isActive: 'true' });
    setModalOpen(true);
  };

  const openEdit = (row: ClassRow) => {
    setEditing(row);
    setForm({
      name: String(row.name ?? ''),
      level: row.level != null ? String(row.level) : '',
      capacity: row.capacity != null ? String(row.capacity) : '40',
      isActive: row.isActive === false ? 'false' : 'true',
    });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? items.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes &amp; Sections</h1>
          <p className="text-muted-foreground">
            Organize grades and homerooms. Manage sections from the Sections module.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/sections')}>
            <Layers className="mr-2 h-4 w-4" />
            Manage sections
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add class
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete?.id && deleteMutation.mutate(String(confirmDelete.id))}
        title="Deactivate class"
        message={
          confirmDelete
            ? `Deactivate "${String(confirmDelete.name)}"? Linked sections will also be deactivated.`
            : ''
        }
        confirmText="Deactivate"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit class' : 'Add class'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !form.name.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Class name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Grade 10, Class 1-A"
          />
          <Input
            label="Level"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            placeholder="e.g. 10, Primary"
          />
          <Input
            label="Capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <LabeledSelect
            label="Status"
            value={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.value })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </div>
      </Modal>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not load classes</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">No classes yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first class, then add sections for each homeroom group.
              </p>
            </div>
            <Button type="button" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add class
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {isFetching ? 'Refreshing…' : `${total} class${total === 1 ? '' : 'es'}`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((row) => {
              const id = String(row.id);
              const active = row.isActive !== false;
              const sections = sectionCountByClass.get(id) ?? 0;
              return (
                <Card
                  key={id}
                  className="flex flex-col overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg">{String(row.name ?? '—')}</CardTitle>
                      {row.level != null && String(row.level).trim() !== '' && (
                        <CardDescription className="mt-1">
                          Level {String(row.level)}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={active ? 'default' : 'secondary'}
                      className={
                        active
                          ? 'shrink-0 border-transparent bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/10'
                          : 'shrink-0'
                      }
                    >
                      {active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardHeader>

                  <CardContent className="flex-1 pb-3">
                    <div className="grid grid-cols-3 gap-2">
                      <StatCell icon={Layers} label="Sections" value={sections} />
                      <StatCell
                        icon={Users}
                        label="Capacity"
                        value={row.capacity != null ? String(row.capacity) : '—'}
                      />
                      <StatCell
                        icon={BookOpen}
                        label="Level"
                        value={row.level != null && String(row.level).trim() ? String(row.level) : '—'}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto flex gap-2 border-t bg-muted/20 px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-w-0 flex-1"
                      onClick={() => openEdit(row)}
                    >
                      <Edit className="mr-1.5 h-4 w-4 shrink-0" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="min-w-0 flex-1"
                      onClick={() => setConfirmDelete(row)}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
