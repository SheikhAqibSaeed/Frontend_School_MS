import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrincipalDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Principal</h1>
      <p className="text-muted-foreground">
        Manage your school: people, academics, finance, and communications. Roles and platform schools are
        managed by super admin only.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'People', description: 'Students, teachers, and school users from the sidebar.' },
          { title: 'Academics', description: 'Classes, sections, exams, marks, and attendance.' },
          { title: 'Finance', description: 'Fees, invoices, and payments.' },
        ].map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle>{c.title}</CardTitle>
              <CardDescription>{c.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
