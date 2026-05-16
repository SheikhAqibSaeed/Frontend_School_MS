'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createStudent } from '@/services/api/students.api';
import { listClasses, listSections } from '@/services/api/academics.api';
import { studentFormSchema, studentFormToApi, type StudentFormValues } from '@/lib/student-schema';
import { StudentFormFields } from '@/components/forms/StudentFormFields';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';

export default function AddStudentPage() {
  const router = useRouter();

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
    defaultValues: {
      admissionNo: '',
      rollNumber: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      classId: '',
      sectionId: '',
    },
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

  const mutation = useMutation({
    mutationFn: (values: StudentFormValues) => createStudent(studentFormToApi(values)),
    onSuccess: (row) => {
      toast.success('Student created');
      router.push(`/admin/students/${String(row.id)}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Create failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add student</h1>
        <p className="text-muted-foreground">Admission, class placement, and guardian details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New student</CardTitle>
          <CardDescription>All guardian information is stored on the student profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
              <StudentFormFields form={form} classes={classes} sectionOptions={sectionOptions} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/students')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating…' : 'Create student'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
