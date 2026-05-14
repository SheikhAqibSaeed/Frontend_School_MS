import { redirect } from 'next/navigation';

export default function TeacherDashboardRedirectPage() {
  redirect('/admin/teacher');
}
