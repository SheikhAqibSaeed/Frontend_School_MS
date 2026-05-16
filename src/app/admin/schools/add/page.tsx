'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSchool } from '@/services/api/schools.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  schoolCode: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  principalName: z.string().optional(),
  principalEmail: z.string().email().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function AddSchoolPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', schoolCode: '', email: '', phone: '', city: '', principalName: '', principalEmail: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      createSchool({
        name: v.name,
        slug: v.slug,
        schoolCode: v.schoolCode?.trim() || undefined,
        email: v.email?.trim() || undefined,
        phone: v.phone?.trim() || undefined,
        city: v.city?.trim() || undefined,
        principalName: v.principalName?.trim() || undefined,
        principalEmail: v.principalEmail?.trim() || undefined,
      }),
    onSuccess: (row) => {
      toast.success('School created');
      router.push(`/admin/schools/${String(row.id)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Add school</h1>
      <Card>
        <CardHeader>
          <CardTitle>School details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug *</FormLabel><FormControl><Input {...field} placeholder="demo-school" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="schoolCode" render={({ field }) => (
                <FormItem><FormLabel>School code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="principalName" render={({ field }) => (
                <FormItem><FormLabel>Principal name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/schools')}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Create'}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
