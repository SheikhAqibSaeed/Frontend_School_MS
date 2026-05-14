'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RouterLink } from '@/components/common/RouterLink';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resetPasswordRequest } from '@/services/api/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RESET_TOKEN_STORAGE_KEY = 'sms_reset_token';

const schema = z
  .object({
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');

  useEffect(() => {
    const fromQuery = searchParams.get('token');
    if (fromQuery) {
      try {
        sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, fromQuery);
      } catch {
        /* private mode / blocked */
      }
      setToken(fromQuery);
      router.replace('/reset-password', { scroll: false });
      return;
    }
    try {
      setToken(sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY) ?? '');
    } catch {
      setToken('');
    }
  }, [router, searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => resetPasswordRequest(token, v.password),
    onSuccess: () => {
      try {
        sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      toast.success('Password updated (demo)');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Wire this page to your Nest reset endpoint when available.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token && (
            <p className="mb-4 text-sm text-destructive">Missing or expired reset link. Request a new reset email.</p>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={!token || mutation.isPending}>
                Update password
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <RouterLink href="/login" className="text-primary hover:underline">
              Back to login
            </RouterLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
