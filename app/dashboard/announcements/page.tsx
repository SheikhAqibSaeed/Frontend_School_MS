import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Bell } from 'lucide-react';

export default function AnnouncementsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="border-l-4 border-red-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Important Notice</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  Important
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                Annual Sports Day will be held on March 15, 2024. All students are required to participate.
              </p>
              <p className="text-sm text-gray-500">Published: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Parent-Teacher Meeting</h3>
              <p className="text-gray-700 mb-2">
                A parent-teacher meeting is scheduled for March 20, 2024. Please confirm your attendance.
              </p>
              <p className="text-sm text-gray-500">Published: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Final Exams Schedule</h3>
              <p className="text-gray-700 mb-2">
                Final examinations will commence from April 1, 2024. Please check the timetable for details.
              </p>
              <p className="text-sm text-gray-500">Published: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

