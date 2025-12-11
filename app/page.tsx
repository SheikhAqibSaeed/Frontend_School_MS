import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          School Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive solution for managing your school operations
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
          {/* <Link
            href="/dashboard"
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Dashboard
          </Link> */}
        </div>
      </div>
    </main>
  );
}

