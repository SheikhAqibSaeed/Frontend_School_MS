'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSchool, updateSchool } from '@/services/api/schools.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  schoolCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  schoolType: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  principalName: z.string().optional(),
  principalEmail: z.string().email().optional().or(z.literal('')),
  principalPhone: z.string().optional(),
  academicYear: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditSchoolPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['schools', id],
    queryFn: () => getSchool(id),
    enabled: Boolean(id),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (!data) return;
    form.reset({
      name: String(data.name ?? ''),
      slug: String(data.slug ?? ''),
      schoolCode: data.schoolCode != null ? String(data.schoolCode) : '',
      registrationNumber: data.registrationNumber != null ? String(data.registrationNumber) : '',
      schoolType: data.schoolType != null ? String(data.schoolType) : '',
      email: data.email != null ? String(data.email) : '',
      phone: data.phone != null ? String(data.phone) : '',
      alternatePhone: data.alternatePhone != null ? String(data.alternatePhone) : '',
      website: data.website != null ? String(data.website) : '',
      address: data.address != null ? String(data.address) : '',
      city: data.city != null ? String(data.city) : '',
      state: data.state != null ? String(data.state) : '',
      country: data.country != null ? String(data.country) : '',
      postalCode: data.postalCode != null ? String(data.postalCode) : '',
      principalName: data.principalName != null ? String(data.principalName) : '',
      principalEmail: data.principalEmail != null ? String(data.principalEmail) : '',
      principalPhone: data.principalPhone != null ? String(data.principalPhone) : '',
      academicYear: data.academicYear != null ? String(data.academicYear) : '',
      timezone: data.timezone != null ? String(data.timezone) : '',
      currency: data.currency != null ? String(data.currency) : '',
    });
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      updateSchool(id, {
        ...v,
        email: v.email?.trim() || undefined,
        principalEmail: v.principalEmail?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('School updated');
      void queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit school</h1>
        <Button variant="outline" onClick={() => router.push('/admin/schools')}>Back</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{String(data?.name ?? 'School')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['name', 'Name *'],
                  ['slug', 'Slug *'],
                  ['schoolCode', 'School code'],
                  ['registrationNumber', 'Registration #'],
                  ['schoolType', 'School type'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['principalName', 'Principal name'],
                  ['principalEmail', 'Principal email'],
                  ['city', 'City'],
                  ['country', 'Country'],
                  ['academicYear', 'Academic year'],
                  ['timezone', 'Timezone'],
                  ['currency', 'Currency'],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} type={name.includes('email') ? 'email' : 'text'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
