import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LibrarianDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Librarian</h1>
      <p className="text-muted-foreground">Catalog, loans, and library announcements.</p>
      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>Open Library from the sidebar to manage books and loans.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
