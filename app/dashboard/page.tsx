import { Card } from '@/components/ui/Card';
import { Users, GraduationCap, DollarSign, Calendar } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '1,234', icon: GraduationCap, color: 'bg-blue-500' },
  { label: 'Total Teachers', value: '45', icon: Users, color: 'bg-green-500' },
  { label: 'Pending Fees', value: '$12,450', icon: DollarSign, color: 'bg-yellow-500' },
  { label: 'Today Attendance', value: '89%', icon: Calendar, color: 'bg-purple-500' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New student registered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Fee payment received</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Exam scheduled</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Upcoming Events">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-medium">Annual Sports Day</p>
              <p className="text-xs text-gray-500">March 15, 2024</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm font-medium">Parent-Teacher Meeting</p>
              <p className="text-xs text-gray-500">March 20, 2024</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm font-medium">Final Exams</p>
              <p className="text-xs text-gray-500">April 1, 2024</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

