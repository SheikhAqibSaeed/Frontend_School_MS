'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bus,
  Edit,
  MapPin,
  Plus,
  Route,
  Trash2,
  Users,
} from 'lucide-react';
import {
  createTransportRoute,
  deleteTransportRoute,
  getTransportStats,
  listTransportRoutes,
  listTransportVehicles,
  updateTransportRoute,
} from '@/services/api/transport.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LabeledSelect } from '@/components/ui/labeled-select';
import { cn } from '@/lib/utils';

type Row = Record<string, unknown>;

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  loading: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-16" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            accent,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function routeVehicleLabel(row: Row): string {
  const vehicle = row.vehicle as { registration?: string } | undefined;
  return vehicle?.registration ? String(vehicle.registration) : '—';
}

function routeDriverLabel(row: Row): string {
  if (row.driverName) return String(row.driverName);
  const desc = row.description ? String(row.description) : '';
  const match = desc.match(/^Driver:\s*([^|]+)/i);
  return match ? match[1].trim() : '—';
}

export default function TransportPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    name: '',
    vehicleId: '',
    driverName: '',
    description: '',
    isActive: 'true',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['transport', 'stats'],
    queryFn: getTransportStats,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['transport', 'vehicles'],
    queryFn: listTransportVehicles,
  });

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['transport', 'routes', page, limit],
    queryFn: () => listTransportRoutes({ page, limit }),
    placeholderData: (p) => p,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        driverName: form.driverName.trim() || undefined,
        description: form.description.trim() || undefined,
        isActive: form.isActive === 'true',
      };
      if (form.vehicleId) body.vehicleId = form.vehicleId;
      else if (editing) body.vehicleId = null;
      if (editing?.id) return updateTransportRoute(String(editing.id), body);
      return createTransportRoute(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Route updated' : 'Route created');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['transport'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransportRoute(id),
    onSuccess: () => {
      toast.success('Route deleted');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['transport'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      vehicleId: '',
      driverName: '',
      description: '',
      isActive: 'true',
    });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const vehicle = row.vehicle as { id?: string } | undefined;
    setForm({
      name: String(row.name ?? ''),
      vehicleId: vehicle?.id ? String(vehicle.id) : row.vehicleId ? String(row.vehicleId) : '',
      driverName: routeDriverLabel(row) === '—' ? '' : routeDriverLabel(row),
      description: String(row.description ?? '').replace(/^Driver:\s*[^|]+\s*\|\s*/i, '').replace(/^Driver:\s*[^|]+$/i, '').trim(),
      isActive: row.isActive === false ? 'false' : 'true',
    });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const vehicleOptions = [
    { value: '', label: 'No vehicle assigned' },
    ...(vehiclesData ?? []).map((v) => ({
      value: v.id,
      label: v.registration,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground">
            Manage school buses, routes, and student assignments.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add route
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total vehicles"
          value={stats?.totalVehicles ?? 0}
          icon={Bus}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          loading={statsLoading}
        />
        <StatCard
          label="Active routes"
          value={stats?.activeRoutes ?? 0}
          icon={Route}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          label="Students using transport"
          value={stats?.studentsUsing ?? 0}
          icon={Users}
          accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          loading={statsLoading}
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Delete route"
        message={`Delete route "${String(pendingDelete?.name ?? '')}"? Student assignments on this route will be removed.`}
        confirmText="Delete"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit route' : 'Add route'}
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
            label="Route name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Route A - Downtown"
          />
          <LabeledSelect
            label="Vehicle"
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            options={vehicleOptions}
          />
          <Input
            label="Driver name"
            value={form.driverName}
            onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            placeholder="e.g. John Driver"
          />
          <Input
            label="Notes"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Pickup area, timing, etc."
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Transport routes
          </CardTitle>
          <CardDescription>
            {data ? `${total} route(s)` : isLoading ? 'Loading…' : 'No routes yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not load routes</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length === 0 && (
            <Alert>
              <AlertTitle>No routes</AlertTitle>
              <AlertDescription>
                Add your first transport route to assign students and vehicles.
              </AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route name</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={String(row.id)} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{String(row.name)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {routeVehicleLabel(row)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {routeDriverLabel(row)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(row.studentCount ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.isActive === false ? 'secondary' : 'default'}
                          className={
                            row.isActive !== false
                              ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
                              : undefined
                          }
                        >
                          {row.isActive === false ? 'Inactive' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(row)}
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(row)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
