# Task Management App - Implementation Guide for Missing Features

## 🎯 Quick Reference: What to Build Next

This document provides code examples and guidance for implementing the most critical missing features.

---

## 🔴 CRITICAL FEATURES

### 1. Task Edit Functionality

**Problem:** Users cannot modify existing tasks.  
**Impact:** Critical - Blocks MVP  
**Status:** Form created but not integrated  
**Effort:** 2-3 hours

#### What Exists:
- [x] `updateTask()` method in `useTasks` hook
- [x] TaskForm component can handle edit mode
- [x] Edit form component references exist

#### What's Missing:
- [ ] Edit button in TaskCard component
- [ ] Edit route/modal
- [ ] Redirect/navigate to edit

#### Implementation Steps:

**Step 1: Add Edit Button to TaskCard**
```tsx
// In TaskCard component, add this button next to Delete button:

<button
  onClick={() => setIsEditing(!isEditing)}
  className="text-blue-500 hover:text-blue-700 text-sm ml-2"
>
  {isEditing ? 'Cancel' : 'Edit'}
</button>

// Add editable form that shows when isEditing is true
{isEditing && (
  <TaskForm 
    initialData={{ ...task, id: task.id }}
    onSuccess={() => {
      setIsEditing(false);
      // Task will auto-update via real-time listener
    }}
  />
)}
```

**Step 2: Create Edit Page (Optional - Better UX)**
```
Create: src/app/dashboard/edit/[id]/page.tsx
```

```tsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/lib/task-hooks';
import { TaskForm } from '@/components/task-form';
import { useEffect, useState } from 'react';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { tasks } = useTasks();
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === params.id);
    setTask(foundTask || null);
  }, [tasks, params.id]);

  if (!task) {
    return <div className="text-center py-8">Loading or task not found...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Task</h1>
        <TaskForm 
          initialData={task}
          onSuccess={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}
```

**Step 3: Update TaskCard to Link to Edit Page**
```tsx
import Link from 'next/link';

<Link 
  href={`/dashboard/edit/${task.id}`}
  className="text-blue-500 hover:text-blue-700"
>
  Edit
</Link>
```

---

### 2. Protected Routes - Redirect Authenticated Users

**Problem:** Logged-in users can access login/signup pages  
**Impact:** High - Poor UX  
**Status:** Dashboard protected, auth pages not  
**Effort:** 1-2 hours

#### Implementation:

**Option A: Client-Side Redirect (Simple)**

```tsx
// In src/app/login/page.tsx, add this to component:

'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null; // Will redirect
  }

  // Your existing login form JSX here...
}
```

**Option B: Middleware (More Robust)**

```typescript
// Create: src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth state from cookies or headers
  const authCookie = request.cookies.get('__session')?.value;
  const isAuthenticated = !!authCookie;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*'],
};
```

**Simplest Solution (Recommended):**
Just add the useEffect redirect to login and signup pages. It's simple and works well.

---

### 3. Comprehensive Error Handling

**Problem:** Generic errors, no user feedback, no retry mechanism  
**Impact:** High - Poor UX during failures  
**Status:** Basic error display only  
**Effort:** 3-4 hours

#### Implementation:

**Step 1: Create Error Boundary Component**

```tsx
// Create: src/components/error-boundary.tsx

'use client';

import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <p className="text-red-700 text-sm mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Create Toast Notification Component**

```tsx
// Create: src/components/toast.tsx

'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Context for managing toasts
const ToastContext = React.createContext<{
  showToast: (message: string, type: ToastType) => void;
}>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded text-white ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                ? 'bg-red-500'
                : toast.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

**Step 3: Update TaskForm with Better Error Handling**

```tsx
// In TaskForm component, update onSubmit:

const onSubmit = async (data: TaskFormData) => {
  try {
    setError(null);
    setIsLoading(true);

    if (initialData?.id) {
      await updateTask(initialData.id, data);
      showToast('Task updated successfully!', 'success');
    } else {
      await addTask(data.title, data.description, data.dueDate);
      showToast('Task created successfully!', 'success');
    }

    reset();
    onSuccess?.();
  } catch (err) {
    const errorMessage = 
      err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
    
    setError(errorMessage);
    showToast(errorMessage, 'error');

    // Add retry button if network error
    if (errorMessage.includes('network') || errorMessage.includes('offline')) {
      // Show retry option
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

### 4. Environment Variables Setup

**Problem:** No `.env.local` file, Firebase config not ready  
**Impact:** Medium - Can't run the app  
**Status:** Config file exists but no setup guide  
**Effort:** 1 hour

#### Solution:

**Create: `.env.local` (Git-ignored, local only)**

```bash
# Firebase Configuration
# Get these from: https://console.firebase.google.com/project/[YOUR_PROJECT]/settings/general

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Add your environment
NEXT_PUBLIC_APP_ENV=development
```

**Create: `.env.example` (Checked into git)**

```bash
# Copy this file to .env.local and fill in your values

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_APP_ENV=development
```

**Update: `README.md` with Setup Section**

```markdown
## Setup Instructions

### 1. Clone Repository
\`\`\`bash
git clone <repo-url>
cd task-management-app
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Create a web app in your project
4. Copy your Firebase config

### 4. Setup Environment Variables
1. Copy \`.env.example\` to \`.env.local\`
2. Fill in your Firebase credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
3. Edit \`.env.local\` with your Firebase config values

### 5. Create Firestore Database
1. In Firebase Console → Firestore Database
2. Create database in test mode (for development)
3. Import security rules from \`FIREBASE_RULES.md\`

### 6. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Create Test User Account
- Go to [http://localhost:3000/signup](http://localhost:3000/signup)
- Create an account
- Start creating tasks!
```

---

## 🟠 HIGH PRIORITY FEATURES

### 5. Task Search

**Effort:** 3 hours  
**Impact:** High

#### Implementation:

```tsx
// Create: src/components/search-bar.tsx

'use client';

import { useState, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search tasks...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

```tsx
// Update TaskList to include search:

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
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((task) => task.status === filterStatus);
    }

    // Sort (existing logic)
    // ...

    return result;
  }, [tasks, searchQuery, filterStatus, sortBy]);

  return (
    <div className="space-y-4">
      <SearchBar onSearch={setSearchQuery} />
      {/* ... rest of component */}
    </div>
  );
}
```

---

### 6. Task Priority Levels

**Effort:** 2-3 hours  
**Impact:** Medium

#### Implementation:

**Step 1: Update Task Interface**

```typescript
// In lib/task-hooks.ts, update Task interface:

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high'; // NEW
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 2: Update Task Validation**

```typescript
// In lib/validations.ts:

export const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'), // NEW
  dueDate: z.string().datetime().optional(),
});
```

**Step 3: Update TaskForm**

```tsx
// Add priority select to TaskForm:

<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Priority
    </label>
    <select
      {...register('priority')}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>
  {/* Status select */}
</div>
```

**Step 4: Update TaskCard Display**

```tsx
const priorityColors: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-red-100 text-red-800',
};

// In TaskCard:
<span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
  {task.priority}
</span>
```

**Step 5: Update Sorting**

```tsx
// In TaskList, add sort option:
<option value="priority">Priority (High First)</option>

// In sort logic:
case 'priority':
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  break;
```

---

### 7. Due Date Visual Indicators

**Effort:** 2 hours  
**Impact:** Medium

```tsx
// Update TaskCard to show due date status:

const getDueDateStatus = (dueDate?: string) => {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-800' };
  if (daysUntilDue === 0) return { label: 'Due Today', color: 'bg-yellow-100 text-yellow-800' };
  if (daysUntilDue <= 3) return { label: 'Due Soon', color: 'bg-orange-100 text-orange-800' };
  
  return null;
};

// In TaskCard render:
{task.dueDate && getDueDateStatus(task.dueDate) && (
  <span className={`px-2 py-1 rounded text-xs font-medium ${getDueDateStatus(task.dueDate)?.color}`}>
    {getDueDateStatus(task.dueDate)?.label}
  </span>
)}
```

---

## 📊 Dashboard Statistics

**Effort:** 2-3 hours

```tsx
// Create: src/components/task-stats.tsx

'use client';

import { Task, useTasks } from '@/lib/task-hooks';
import { useMemo } from 'react';

export function TaskStats() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== 'done'
      ).length,
      completionPercentage:
        tasks.length === 0
          ? 0
          : Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100),
    };
  }, [tasks]);

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className={`${color} rounded-lg p-4 text-white`}>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <StatCard label="Total" value={stats.total} color="bg-blue-500" />
      <StatCard label="To Do" value={stats.todo} color="bg-gray-500" />
      <StatCard label="In Progress" value={stats.inProgress} color="bg-yellow-500" />
      <StatCard label="Done" value={stats.done} color="bg-green-500" />
      <StatCard label="Overdue" value={stats.overdue} color="bg-red-500" />

      <div className="col-span-2 md:col-span-5">
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Completion</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <p className="text-lg font-bold">{stats.completionPercentage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Pick ONE feature** from Critical section
2. **Implement completely** (don't skip steps)
3. **Test thoroughly**
4. **Move to next feature**

**Recommended order:**
1. Task Edit (blocks MVP)
2. Protected Routes (good UX)
3. Error Handling (improves reliability)
4. Environment Setup (enables team)
5. Task Search (improves usability)

---

**Generated:** February 5, 2026
