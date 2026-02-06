'use client';

import { useAuth } from '@/lib/auth-context';
import { useLogout } from '@/lib/auth-hooks';
import { TaskForm } from '@/components/task-form';
import { TaskList } from '@/components/task-list';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardContent() {
  const router = useRouter();
  const authState = useAuth() || { user: null, loading: false };
  const { user, loading } = authState;
  const logoutState = useLogout() || { logout: async () => {} };
  const { logout } = logoutState;
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            {showForm ? 'Hide Form' : 'Create New Task'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <TaskForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        <TaskList />
      </div>
    </main>
  );
}
