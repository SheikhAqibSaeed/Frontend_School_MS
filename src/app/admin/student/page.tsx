import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Student portal</h1>
      <p className="text-muted-foreground">Timetable, homework, results, and announcements.</p>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
          <CardDescription>Use Homework and Results from the menu.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
