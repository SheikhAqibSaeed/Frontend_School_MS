import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground">Platform-wide visibility and school onboarding.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>Create and manage tenant schools.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use the sidebar to open Schools or Settings.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Roles and permissions are managed in the Nest API.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Select a school above to send scoped API calls.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Cross-school analytics (coming soon).</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
