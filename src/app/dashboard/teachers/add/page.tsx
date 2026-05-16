'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTeacher } from '@/services/api/teachers.api';
import { teacherFormSchema, teacherFormToApi, type TeacherFormValues } from '@/lib/teacher-schema';
import { TeacherFormFields } from '@/components/forms/TeacherFormFields';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';

const createSchema = teacherFormSchema.refine(
  (v) => Boolean(v.password && v.password.length >= 8 && v.password === v.confirmPassword),
  { message: 'Passwords must match (min 8 chars)', path: ['confirmPassword'] },
);

export default function AddTeacherPage() {
  const router = useRouter();
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      employeeNo: '',
      joiningDate: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TeacherFormValues) => createTeacher(teacherFormToApi(values, true)),
    onSuccess: (data) => {
      toast.success('Teacher created');
      router.replace(`/admin/teachers/${String(data.id)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add teacher</h1>
      <Card>
        <CardHeader>
          <CardTitle>Staff record</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
              <TeacherFormFields form={form} isCreate />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/teachers')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating…' : 'Create teacher'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
