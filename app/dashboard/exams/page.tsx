import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, FileText } from 'lucide-react';

export default function ExamsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Exams & Results</h1>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Schedule Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Upcoming Exams">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium text-gray-900">Mid-Term Examination</p>
              <p className="text-sm text-gray-600">Class 10</p>
              <p className="text-xs text-gray-500">March 15 - March 20, 2024</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium text-gray-900">Final Examination</p>
              <p className="text-sm text-gray-600">All Classes</p>
              <p className="text-xs text-gray-500">April 1 - April 15, 2024</p>
            </div>
          </div>
        </Card>

        <Card title="Quick Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Exams</span>
              <span className="text-2xl font-bold text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Results Published</span>
              <span className="text-2xl font-bold text-green-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Results</span>
              <span className="text-2xl font-bold text-yellow-600">4</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Exam Results">
        <div className="mb-4 flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Exams</option>
            <option>Mid-Term</option>
            <option>Final</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Classes</option>
            <option>Class 10</option>
            <option>Class 9</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  John Doe
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Mid-Term
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Mathematics
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  85 / 100
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    A
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

