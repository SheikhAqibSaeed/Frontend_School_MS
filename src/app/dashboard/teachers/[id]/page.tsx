'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteTeacher, getTeacher, updateTeacher } from '@/services/api/teachers.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  employeeNo: z.string().min(1, 'Required'),
  joiningDate: z.string().min(1, 'Required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  isActive: z.enum(['true', 'false']),
});

type FormValues = z.infer<typeof schema>;

function joiningDateInputValue(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.slice(0, 10);
  return '';
}

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === 'string' ? params.id : '';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teachers', id],
    queryFn: () => getTeacher(id),
    enabled: Boolean(id),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      employeeNo: '',
      joiningDate: '',
      qualification: '',
      specialization: '',
      isActive: 'true',
    },
  });

  useEffect(() => {
    if (!data) return;
    const user = data.user as Record<string, unknown> | undefined;
    form.reset({
      email: String(user?.email ?? ''),
      firstName: String(user?.firstName ?? ''),
      lastName: String(user?.lastName ?? ''),
      phone: user?.phone != null ? String(user.phone) : '',
      employeeNo: String(data.employeeNo ?? ''),
      joiningDate: joiningDateInputValue(data.joiningDate),
      qualification: data.qualification != null ? String(data.qualification) : '',
      specialization: data.specialization != null ? String(data.specialization) : '',
      isActive: data.isActive === false ? 'false' : 'true',
    });
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateTeacher(id, {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone?.trim() || undefined,
        employeeNo: values.employeeNo,
        joiningDate: new Date(values.joiningDate).toISOString(),
        qualification: values.qualification?.trim() || undefined,
        specialization: values.specialization?.trim() || undefined,
        isActive: values.isActive === 'true',
      }),
    onSuccess: () => {
      toast.success('Teacher updated');
      void queryClient.invalidateQueries({ queryKey: ['teachers', id] });
      void queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeacher(id),
    onSuccess: () => {
      toast.success('Teacher deactivated');
      void queryClient.invalidateQueries({ queryKey: ['teachers'] });
      router.push('/admin/teachers');
    },
    onError: (err: Error) => toast.error(err.message ?? 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher profile</h1>
          <p className="text-muted-foreground">Edit details or deactivate this teacher.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/admin/teachers')}>
            Back to teachers
          </Button>
          <Button
            variant="outline"
            type="button"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
            disabled={deleteMutation.isPending || !data}
          >
            Deactivate
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Deactivate teacher"
        message="This marks the teacher as inactive. You can set them active again from this form later."
        confirmText="Deactivate"
        variant="danger"
      />

      <Card>
        <CardHeader>
          <CardTitle>Record</CardTitle>
          <CardDescription>ID: {id || '—'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-80 w-full" />}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {data && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employeeNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
