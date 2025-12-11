import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Bus } from 'lucide-react';

export default function TransportPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Bus className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <Bus className="w-10 h-10 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Students Using</p>
              <p className="text-2xl font-bold text-gray-900">234</p>
            </div>
            <Bus className="w-10 h-10 text-purple-500" />
          </div>
        </Card>
      </div>

      <Card title="Transport Routes">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
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
                  Route A - Downtown
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Bus-001
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  John Driver
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  35
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

