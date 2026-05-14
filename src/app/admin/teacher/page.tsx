import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Teacher workspace</h1>
      <p className="text-muted-foreground">Attendance, homework, marks, and class rosters.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Jump to Attendance or Timetable.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grading</CardTitle>
            <CardDescription>Marks entry and results publishing.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
