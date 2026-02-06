'use client';

import { Task } from '@/lib/task-hooks';
import { useTasks } from '@/lib/task-hooks';
import { useState } from 'react';
import { TaskForm } from './task-form';

interface TaskCardProps {
  task: Task;
}

const statusColors: Record<string, string> = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'done': 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusChange = async (newStatus: typeof task.status) => {
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        setIsDeleting(true);
        await deleteTask(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <TaskForm 
          initialData={{ 
            title: task.title, 
            description: task.description,
            status: task.status,
            dueDate: task.dueDate,
            id: task.id 
          }} 
          onSuccess={() => setIsEditing(false)}
        />
        <button
          onClick={() => setIsEditing(false)}
          className="mt-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 flex-1">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700 text-sm ml-2"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:text-gray-400 text-sm ml-2"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as typeof task.status)}
          className={`text-sm px-3 py-1 rounded-full font-medium cursor-pointer ${statusColors[task.status]}`}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {formattedDate && task.dueDate && (
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            new Date(task.dueDate) < new Date() && task.status !== 'done'
              ? 'bg-red-100 text-red-800'
              : new Date(task.dueDate).toDateString() === new Date().toDateString()
              ? 'bg-yellow-100 text-yellow-800'
              : 'text-gray-500'
          }`}
          >
            {formattedDate}
          </span>
        )}
      </div>
    </div>
  );
}
