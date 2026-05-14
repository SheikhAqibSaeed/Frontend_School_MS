import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountantDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Accountant</h1>
      <p className="text-muted-foreground">Fees, invoices, payments, and financial reports.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {['Fees', 'Invoices', 'Payments'].map((t) => (
          <Card key={t}>
            <CardHeader>
              <CardTitle>{t}</CardTitle>
              <CardDescription>Open the matching sidebar entry.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
