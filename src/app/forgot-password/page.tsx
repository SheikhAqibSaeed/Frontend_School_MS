'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RouterLink } from '@/components/common/RouterLink';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { forgotPasswordRequest } from '@/services/api/auth.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: (v: FormValues) => forgotPasswordRequest(v.email),
    onSuccess: () => {
      toast.message('If an account exists, reset instructions will be sent.');
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email — integration with the Nest mailer can be added later.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mutation.isSuccess && (
                <Alert>
                  <AlertTitle>Request received</AlertTitle>
                  <AlertDescription>Check your inbox (demo — no email is sent yet).</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                Send reset link
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
