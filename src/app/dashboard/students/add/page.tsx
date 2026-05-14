'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createStudent } from '@/services/api/students.api';
import { listClasses, listSections } from '@/services/api/academics.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  admissionNo: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().min(1, 'Pick a class'),
  sectionId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createStudent({
        admissionNo: values.admissionNo,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: new Date(values.dateOfBirth).toISOString(),
        gender: values.gender,
        classId: values.classId,
        sectionId: values.sectionId || undefined,
      }),
    onSuccess: (data) => {
      toast.success('Student created');
      router.replace(`/admin/students/${String(data.id)}`);
    },
    onError: (err: Error) => toast.error(err.message ?? 'Could not create student'),
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add student</h1>
          <p className="text-muted-foreground">Creates a student record for the active school.</p>
        </div>
        <Button variant="outline" type="button" onClick={() => router.push('/admin/students')}>
          Back to list
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Fields match the backend `CreateStudentBody` contract.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="admissionNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission number</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
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
                          <SelectValue placeholder="Select" />
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Create student'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
