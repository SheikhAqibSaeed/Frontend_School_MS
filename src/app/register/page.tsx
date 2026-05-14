'use client';

import { useState } from 'react';
import { RouterLink } from '@/components/common/RouterLink';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listRegisterSchools, registerSchoolUser } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { syncUiSessionCookie } from '@/lib/ui-session-cookie';
import { dashboardHrefForRole } from '@/config/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LabeledSelect } from '@/components/ui/labeled-select';

function apiErrMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: unknown } } }).response;
    const m = res?.data?.message;
    if (Array.isArray(m)) return m.map(String).join(', ');
    if (typeof m === 'string') return m;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    schoolId: '',
    role: 'STUDENT' as 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'ACCOUNTANT' | 'LIBRARIAN',
  });
  const [error, setError] = useState('');

  const { data: schools = [], isLoading: schoolsLoading, error: schoolsError } = useQuery({
    queryKey: ['auth', 'register-schools'],
    queryFn: listRegisterSchools,
  });

  const mutation = useMutation({
    mutationFn: registerSchoolUser,
    onSuccess: async (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      const ok = await syncUiSessionCookie(data.accessToken);
      if (!ok) {
        toast.error('Account created but session cookie failed. Add JWT_ACCESS_SECRET to the Next env (match Nest) and sign in again.');
        return;
      }
      toast.success('Account created');
      const home = dashboardHrefForRole(useAuthStore.getState().primaryRole);
      router.replace(home);
    },
    onError: (err: unknown) => {
      const msg = apiErrMessage(err);
      setError(msg);
      toast.error(msg);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.schoolId) {
      setError('Please select a school');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    mutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone.trim() || null,
      schoolId: formData.schoolId,
      role: formData.role,
    });
  };

  const schoolsLoadErr = schoolsError ? apiErrMessage(schoolsError) : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600">Sign up for an existing school</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || schoolsLoadErr) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error || schoolsLoadErr}
            </div>
          )}

          <LabeledSelect
            label="School"
            value={formData.schoolId}
            onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
            required
            disabled={schoolsLoading || schools.length === 0}
            options={[
              { value: '', label: schoolsLoading ? 'Loading schools…' : 'Select your school' },
              ...schools.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />

            <Input
              label="Last name"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <LabeledSelect
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as typeof formData.role,
              })
            }
            required
            options={[
              { value: 'STUDENT', label: 'Student' },
              { value: 'TEACHER', label: 'Teacher' },
              { value: 'ADMIN', label: 'School admin' },
              { value: 'PRINCIPAL', label: 'Principal' },
              { value: 'ACCOUNTANT', label: 'Accountant' },
              { value: 'LIBRARIAN', label: 'Librarian' },
            ]}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            minLength={8}
          />

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending || schoolsLoading}>
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <RouterLink href="/login" className="font-medium text-primary-600 hover:underline">
              Sign in
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  );
}
