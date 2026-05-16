import { redirect } from 'next/navigation';

export default function PrincipalDashboardRedirectPage() {
  redirect('/admin/principal');
}
