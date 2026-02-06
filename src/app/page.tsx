import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📋 Task Manager
          </h1>
          <p className="text-lg text-gray-600">
            Organize your work, track your progress, and accomplish your goals
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <h3 className="font-semibold text-gray-900">Create Tasks</h3>
              <p className="text-sm text-gray-600">
                Add tasks with descriptions and due dates
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📌</span>
            <div>
              <h3 className="font-semibold text-gray-900">Track Status</h3>
              <p className="text-sm text-gray-600">
                Mark tasks as Todo, In Progress, or Done
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="font-semibold text-gray-900">Search & Filter</h3>
              <p className="text-sm text-gray-600">
                Find tasks instantly with search and filters
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Login</h3>
              <p className="text-sm text-gray-600">
                Your tasks are safe with Firebase auth
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Built with Next.js, React, TypeScript, and Firebase</p>
        </div>
      </div>
    </div>
  );
}
