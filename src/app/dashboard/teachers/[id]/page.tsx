'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteTeacher, getTeacher, updateTeacher } from '@/services/api/teachers.api';
import {
  teacherFormSchema,
  teacherFormToApi,
  teacherRecordToForm,
  type TeacherFormValues,
} from '@/lib/teacher-schema';
import { TeacherFormFields } from '@/components/forms/TeacherFormFields';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: teacherRecordToForm({}),
  });

  useEffect(() => {
    if (data) form.reset(teacherRecordToForm(data));
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: TeacherFormValues) => updateTeacher(id, teacherFormToApi(values, false)),
    onSuccess: () => {
      toast.success('Teacher updated');
      void queryClient.invalidateQueries({ queryKey: ['teachers', id] });
      void queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTeacher(id),
    onSuccess: () => {
      toast.success('Teacher deactivated');
      router.push('/admin/teachers');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher profile</h1>
          <p className="text-muted-foreground">Employment, qualifications, and account details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/teachers')}>Back</Button>
          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => setConfirmDelete(true)}
            disabled={!data}
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
        message="Soft-deletes this teacher. They will lose access to assigned classes."
        confirmText="Deactivate"
        variant="danger"
      />

      <Card>
        <CardHeader>
          <CardTitle>Record</CardTitle>
          <CardDescription>ID: {id}</CardDescription>
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
                <TeacherFormFields form={form} showStatus />
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
