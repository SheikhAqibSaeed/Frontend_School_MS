'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteStudent, getStudent, updateStudent } from '@/services/api/students.api';
import { listClasses, listSections } from '@/services/api/academics.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
  admissionNo: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().min(1, 'Pick a class'),
  sectionId: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  isActive: z.enum(['true', 'false']),
});

type FormValues = z.infer<typeof schema>;

function dateOnly(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.slice(0, 10);
  return '';
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === 'string' ? params.id : '';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudent(id),
    enabled: Boolean(id),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses({ limit: 100 }),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', 'all'],
    queryFn: () => listSections({ limit: 200 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      admissionNo: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      classId: '',
      sectionId: '',
      bloodGroup: '',
      address: '',
      isActive: 'true',
    },
  });

  const classId = form.watch('classId');

  const sectionOptions = useMemo(() => {
    const items = sectionsData?.items ?? [];
    if (!classId) return [];
    return items.filter((s) => {
      const c = s.class as { id?: string } | undefined;
      return c?.id === classId;
    });
  }, [sectionsData, classId]);

  useEffect(() => {
    if (!data) return;
    const sec = data.section as { id?: string } | undefined;
    form.reset({
      admissionNo: String(data.admissionNo ?? ''),
      firstName: String(data.firstName ?? ''),
      lastName: String(data.lastName ?? ''),
      dateOfBirth: dateOnly(data.dateOfBirth),
      gender: (['MALE', 'FEMALE', 'OTHER'].includes(String(data.gender))
        ? String(data.gender)
        : 'MALE') as FormValues['gender'],
      classId: String(data.classId ?? ''),
      sectionId: sec?.id ? String(sec.id) : '',
      bloodGroup: data.bloodGroup != null ? String(data.bloodGroup) : '',
      address: data.address != null ? String(data.address) : '',
      isActive: data.isActive === false ? 'false' : 'true',
    });
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateStudent(id, {
        admissionNo: values.admissionNo,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        gender: values.gender,
        classId: values.classId,
        sectionId: values.sectionId ? values.sectionId : null,
        bloodGroup: values.bloodGroup?.trim() ? values.bloodGroup.trim() : null,
        address: values.address?.trim() ? values.address.trim() : null,
        isActive: values.isActive === 'true',
      }),
    onSuccess: () => {
      toast.success('Student updated');
      void queryClient.invalidateQueries({ queryKey: ['students', id] });
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(id),
    onSuccess: () => {
      toast.success('Student deactivated');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      router.push('/admin/students');
    },
    onError: (err: Error) => toast.error(err.message ?? 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student profile</h1>
          <p className="text-muted-foreground">Edit enrollment details or deactivate this student.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/admin/students')}>
            Back to students
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
        title="Deactivate student"
        message="This marks the student as inactive. You can set them active again from this form later."
        confirmText="Deactivate"
        variant="danger"
      />

      <Card>
        <CardHeader>
          <CardTitle>Record</CardTitle>
          <CardDescription>ID: {id || '—'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-96 w-full" />}
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
                  name="admissionNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission number</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.setValue('sectionId', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(classesData?.items ?? []).map((c) => (
                            <SelectItem key={String(c.id)} value={String(c.id)}>
                              {String(c.name ?? c.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section (optional)</FormLabel>
                      <Select
                        disabled={!classId || sectionOptions.length === 0}
                        onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                        value={field.value ? field.value : '__none__'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={classId ? 'Select section' : 'Pick a class first'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {sectionOptions.map((s) => (
                            <SelectItem key={String(s.id)} value={String(s.id)}>
                              {String(s.name ?? s.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood group</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
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
