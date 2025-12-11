import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Plus } from 'lucide-react';

export default function FeesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Collect Fee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">$45,230</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
              <p className="text-2xl font-bold text-gray-900">$12,450</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">$3,200</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-500" />
          </div>
        </Card>
      </div>

      <Card title="Fee Payments">
        <div className="mb-4 flex gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  John Doe (STU2024001)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Tuition Fee
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900">Pay</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

