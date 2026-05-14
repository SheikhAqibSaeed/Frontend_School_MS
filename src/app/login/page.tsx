'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RouterLink } from '@/components/common/RouterLink';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { loginRequest } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { syncUiSessionCookie } from '@/lib/ui-session-cookie';
import { dashboardHrefForRole } from '@/config/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'At least 8 characters'),
  schoolId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', schoolId: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      loginRequest({
        email: values.email,
        password: values.password,
        schoolId: values.schoolId || undefined,
      }),
    onSuccess: async (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      const ok = await syncUiSessionCookie(data.accessToken);
      if (!ok) {
        toast.error('Could not establish a secure browser session. Check JWT_ACCESS_SECRET on the Next server.');
        return;
      }
      toast.success('Signed in');
      const home = dashboardHrefForRole(useAuthStore.getState().primaryRole);
      router.replace(home);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Login failed');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in with your school credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School ID (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Required if you belong to multiple schools" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mutation.isError && (
                <Alert variant="destructive">
                  <AlertTitle>Could not sign in</AlertTitle>
                  <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <RouterLink href="/forgot-password" className="hover:text-foreground">
              Forgot password?
            </RouterLink>
            <RouterLink href="/register" className="hover:text-foreground">
              Create an account
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
