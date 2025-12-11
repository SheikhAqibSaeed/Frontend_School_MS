'use client';

import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();

  // Get user display name
  const displayName = user 
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : 'Guest User';
  
  const displayEmail = user?.email || 'guest@school.com';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {loading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-gray-500">
                {loading ? '...' : displayEmail}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

