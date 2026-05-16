'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteStudent, getStudent, updateStudent } from '@/services/api/students.api';
import { listClasses, listSections } from '@/services/api/academics.api';
import {
  studentFormSchema,
  studentFormToApi,
  studentRecordToForm,
  type StudentFormValues,
} from '@/lib/student-schema';
import { StudentFormFields } from '@/components/forms/StudentFormFields';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: studentRecordToForm({}),
  });

  const classId = form.watch('classId');

  const sectionOptions = useMemo(() => {
    const items = sectionsData?.items ?? [];
    if (!classId) return [];
    return items
      .filter((s) => {
        const c = s.class as { id?: string } | undefined;
        return c?.id === classId;
      })
      .map((s) => ({ id: String(s.id), name: String(s.name ?? s.id) }));
  }, [sectionsData, classId]);

  const classes = useMemo(
    () =>
      (classesData?.items ?? []).map((c) => ({
        id: String(c.id),
        name: String(c.name ?? c.id),
      })),
    [classesData],
  );

  useEffect(() => {
    if (data) form.reset(studentRecordToForm(data));
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: StudentFormValues) =>
      updateStudent(id, {
        ...studentFormToApi(values, true),
        sectionId: values.sectionId?.trim() ? values.sectionId : null,
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
          <p className="text-muted-foreground">Enrollment, guardian, and emergency contacts.</p>
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
        message="Soft-deletes this student record. They will no longer appear in lists."
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
              <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-6">
                <StudentFormFields
                  form={form}
                  classes={classes}
                  sectionOptions={sectionOptions}
                  showStatus
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
