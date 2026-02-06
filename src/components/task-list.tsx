'use client';

import { Task, useTasks } from '@/lib/task-hooks';
import { TaskCard } from './task-card';
import { useState, useMemo } from 'react';

type SortBy = 'date-asc' | 'date-desc' | 'created';
type FilterStatus = 'all' | 'todo' | 'in-progress' | 'done';

export function TaskList() {
  const { tasks, loading, error } = useTasks();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (searchQuery) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((task) => task.status === filterStatus);
    }

    // Sort
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'date-desc':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        });
        break;
      case 'created':
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return result;
  }, [tasks, filterStatus, sortBy, searchQuery]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading tasks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Tasks
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created">Newest First</option>
              <option value="date-asc">Due Date (Earliest)</option>
              <option value="date-desc">Due Date (Latest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{tasks.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">To Do</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">
            {tasks.filter((t) => t.status === 'todo').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Done</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {tasks.filter((t) => t.status === 'done').length}
          </p>
        </div>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'No tasks match your search.' : 'No tasks found. Create your first task to get started!'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
