# Task Management App 📝

A modern, full-featured task management web application built with Next.js 16, Firebase, and TypeScript. Users can authenticate with email/password, create, update, delete, and manage their tasks with filtering and sorting capabilities.

## 🎯 Features

✅ **Authentication**
- Email & password signup/login
- Secure session management with Firebase Auth
- Password reset functionality
- Protected routes

✅ **Task Management (CRUD)**
- Create tasks with title, description, and due date
- Update/edit existing tasks
- Delete tasks with confirmation
- View only your own tasks (user-specific)
- Real-time synchronization with Firestore

✅ **Task Organization**
- Task status: Todo, In Progress, Done
- Filter tasks by status
- Sort by due date (ascending/descending)
- Sort by creation date (newest first)
- Search tasks by title or description
- Dashboard statistics (total tasks, completion rate)

✅ **User Experience**
- Clean, responsive UI with Tailwind CSS
- Real-time notifications (success/error)
- Error handling with user-friendly messages
- Loading states and transitions
- Mobile-optimized design

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 16 (React 19) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Form Validation** | Zod + React Hook Form |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase Firestore |
| **State Management** | React Context API + Custom Hooks |
| **Deployment** | Vercel (Recommended) |

## 📋 Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── forgot-password/    # Password reset
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home/root page
│   └── providers.tsx       # App providers
├── components/
│   ├── login-form.tsx      # Login form component
│   ├── signup-form.tsx     # Signup form component
│   ├── task-form.tsx       # Task create/edit form
│   ├── task-card.tsx       # Task display card
│   ├── task-list.tsx       # Task list with filters
│   ├── toast.tsx           # Toast notifications
│   └── error-boundary.tsx  # Error boundary
├── lib/
│   ├── firebase.ts         # Firebase config
│   ├── auth-context.tsx    # Auth context provider
│   ├── auth-hooks.ts       # Auth hooks (signup, login, etc.)
│   ├── task-hooks.ts       # Task CRUD hooks
│   └── validations.ts      # Zod validation schemas
└── public/                 # Static assets
```

## 🔐 Authentication Flow

1. **User Signup**
   - User enters email, password, and display name
   - Validation with Zod schema
   - Firebase creates user account
   - User is automatically logged in
   - Redirected to dashboard

2. **User Login**
   - User enters email and password
   - Firebase authenticates credentials
   - Session stored in auth context
   - Redirected to dashboard

3. **Route Protection**
   - Unauthenticated users redirected to login
   - Authenticated users redirected away from auth pages
   - Dashboard requires active session

4. **Session Management**
   - Real-time auth state listener via Firebase
   - Context provides user information throughout app
   - Logout clears session

## 📦 Database Structure

### Firebase Firestore Collection: `tasks`

```typescript
{
  id: string;                    // Document ID
  userId: string;                // User's Firebase UID
  title: string;                 // Task title
  description?: string;          // Optional description
  status: "todo" | "in-progress" | "done";
  dueDate?: string;              // ISO datetime string
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### How Tasks Link to Users

- Every task includes a `userId` field
- `userId` matches the authenticated user's Firebase UID
- Firestore security rules enforce user-specific access
- Real-time queries filtered by `userId`

**Security Rules:**
```javascript
match /tasks/{taskId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth.uid == request.resource.data.userId;
  allow update: if request.auth.uid == resource.data.userId;
  allow delete: if request.auth.uid == resource.data.userId;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Authentication and Firestore enabled
- Vercel account (for deployment)

### Local Development

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd task-management-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBlkSzxzLwwKLwkrP5UdJIVMQ8DFfG1nCE
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=task-management-app-817af.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=task-management-app-817af
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=task-management-app-817af.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=944877142026
   NEXT_PUBLIC_FIREBASE_APP_ID=1:944877142026:web:ad799ef652dce5780cdff3
   ```

4. **Setup Firestore Database**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new Firestore database in test mode
   - Under "Rules" tab, paste the security rules from `FIREBASE_RULES.md`

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser

6. **Create Test Account**
   - Go to http://localhost:3000/signup
   - Create an account
   - Start creating tasks!

## 🧪 Filter & Sort Logic

### Filtering
- **By Status:** Filter tasks showing only Todo, In Progress, or Done
- **By Search:** Real-time search across task titles and descriptions
- Filters are applied client-side using `useMemo` for performance

### Sorting
- **Newest First:** Sort by creation date (descending)
- **Due Date Earliest:** Sort by due date (ascending)
- **Due Date Latest:** Sort by due date (descending)
- Sorting logic handles tasks without due dates (places them last)

## 📊 Status and Filter Implementation

```typescript
// Example filter and sort logic
const filteredTasks = tasks
  .filter(task => task.userId === currentUser.uid)        // User-specific
  .filter(task => filterStatus === 'all' || task.status === filterStatus) // Status
  .filter(task => searchQuery === '' || task.title.includes(searchQuery))  // Search
  .sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } // ... other sort cases
  });
```

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - Copy all values from `.env.local`
   - Add them as environment variables in Vercel dashboard
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
```

### Step 3: Configure Production Firebase

1. In Firebase Console, add your Vercel domain to authorized domains:
   - Settings → Authentication → Authorized domains
   - Add: `your-project.vercel.app`

2. Update Firestore Security Rules to production:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, update, delete: if request.auth.uid == resource.data.userId;
         allow create: if request.auth.uid == request.resource.data.userId &&
                          request.resource.data.title != null &&
                          request.resource.data.title != "";
       }
     }
   }
   ```

### Step 4: Verify Deployment
- Visit your Vercel URL
- Test signup/login
- Create a test task
- Verify filters and search work

## 🐛 Common Issues & Solutions

### Issue: "Firebase config is not initialized"
**Solution:** Ensure `.env.local` has all required Firebase credentials

### Issue: "User-specific tasks not showing"
**Solution:** Check Firestore security rules and ensure `userId` field matches `request.auth.uid`

### Issue: "Tasks not syncing in real-time"
**Solution:** Verify Firestore collection name is `tasks` and real-time listener is active

### Issue: "Deploy fails on Vercel"
**Solution:** 
- Ensure all environment variables are set in Vercel dashboard
- Run `npm run build` locally to catch build errors
- Check browser console for runtime errors

## 📈 Performance Optimizations

- ✅ Real-time Firestore listeners for sync
- ✅ React.useMemo for filter/sort operations
- ✅ Next.js automatic code splitting
- ✅ Tailwind CSS for optimized styling
- ✅ Server-side rendering where possible

## 🔒 Security Considerations

- ✅ Firebase Authentication handles password security
- ✅ Firestore security rules enforce user-specific access
- ✅ TypeScript prevents type-related vulnerabilities
- ✅ Zod validation on client and server
- ✅ Environment variables for sensitive config
- ⚠️ Add rate limiting for production
- ⚠️ Enable HTTPS (automatic on Vercel)
- ⚠️ Consider adding 2FA for enhanced security

## 🤖 Assumptions

1. **User Uniqueness:** Each user has unique email address
2. **Task Ownership:** Tasks are completely owned by creator
3. **No Collaboration:** Tasks are private (not shared)
4. **Date Format:** Due dates stored as ISO datetime strings
5. **Real-time Sync:** App assumes always-connected user
6. **Firebase Quota:** Assumes free Firebase tier is sufficient
7. **No Offline Mode:** Tasks sync require internet connection

## 📝 API Documentation

### useAuth Hook
```typescript
const { user, loading, error } = useAuth();
// Returns current authenticated user or null
```

### useTasks Hook
```typescript
const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks();
// tasks: Task[]
// addTask(title, description?, dueDate?): Promise<void>
// updateTask(id, updates): Promise<void>
// deleteTask(id): Promise<void>
```

### useToast Hook
```typescript
const { showToast } = useToast();
// showToast(message, 'success' | 'error' | 'warning' | 'info')
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project

## 🎯 Future Enhancements

- [ ] Task priority levels
- [ ] Task tags/categories
- [ ] Due date reminders/notifications
- [ ] Task sharing and collaboration
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email notifications

---

**Built with ❤️ using Next.js + Firebase**

For questions or issues, please open a GitHub issue.
