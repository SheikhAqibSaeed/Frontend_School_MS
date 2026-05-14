import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="School Information">
          <form className="space-y-4">
            <Input label="School Name" defaultValue="ABC School" />
            <Input label="Address" defaultValue="123 Main Street" />
            <Input label="Phone" type="tel" defaultValue="+1 234 567 8900" />
            <Input label="Email" type="email" defaultValue="info@abcschool.com" />
            <Button type="submit">Save Changes</Button>
          </form>
        </Card>

        <Card title="System Settings">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>2024-2025</option>
                <option>2023-2024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>UTC</option>
                <option>Asia/Karachi</option>
              </select>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

