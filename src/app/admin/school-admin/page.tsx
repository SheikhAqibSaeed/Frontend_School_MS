import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">School Admin</h1>
      <p className="text-muted-foreground">Operate your campus: people, academics, finance, and communications.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Roles & sidebar',
            description:
              'The left menu only lists modules a user is allowed to use (from role permissions). Change what appears for each role under Dashboard → Roles → open a role → Permissions.',
          },
          { title: 'Students', description: 'Shortcuts live in the sidebar.' },
          { title: 'Staffing', description: 'Shortcuts live in the sidebar.' },
          { title: 'Finance', description: 'Shortcuts live in the sidebar.' },
          { title: 'Academics', description: 'Shortcuts live in the sidebar.' },
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
