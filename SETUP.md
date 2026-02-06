# Setup Guide

## Step 1: Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Firebase account (free at https://firebase.google.com)
- Git for version control

## Step 2: Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "task-management-app")
4. Accept the default settings and create the project
5. Wait for project to be created (takes a few seconds)

### Enable Authentication
1. In Firebase Console, go to **Build → Authentication**
2. Click **Get Started**
3. Click on **Email/Password** provider
4. Enable it and click **Save**

### Create Firestore Database
1. Go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (change to production rules later)
4. Select your preferred region
5. Click **Create**

### Get Firebase Credentials
1. Go to **Project Settings** (gear icon in top-left)
2. Scroll to **Your apps** section
3. If no web app exists, click **Add App** → **Web** (</> icon)
4. Copy the Firebase config object
5. Save the credentials for next step

## Step 3: Local Development Setup

### Clone and Install
```bash
# Navigate to your project directory
cd task-management-app

# Install dependencies
npm install

# Verify installation
npm run build
```

### Configure Firebase
1. Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Firebase credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Setup Firestore Security Rules
1. Go to Firebase Console → **Firestore Database → Rules**
2. Click **Edit Rules**
3. Replace with rules from [FIREBASE_RULES.md](./FIREBASE_RULES.md)
4. Click **Publish**

## Step 4: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the App

1. **Sign Up**: Create a new account with email and password
2. **Create Task**: Add a task from the dashboard
3. **Manage Tasks**: Update status, edit, or delete tasks
4. **Filter & Sort**: Test filtering by status and sorting options
5. **Logout**: Test logout functionality

## Troubleshooting

### "Firebase configuration is not defined"
- Verify `.env.local` exists in project root
- Restart dev server after updating `.env.local`
- Check that all variables are present in `.env.local`

### "Permission denied" error when creating tasks
- Ensure Firestore rules are published
- Verify you're logged in
- Check that `userId` field is being set correctly

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

## Next Steps

1. **Deploy to Vercel**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Customize UI**: Modify Tailwind classes in components
3. **Add Features**: Implement categories, priorities, or sharing
4. **Configure Production Rules**: Use enhanced rules from [FIREBASE_RULES.md](./FIREBASE_RULES.md)

## Environment Variables Explained

- **NEXT_PUBLIC_FIREBASE_API_KEY**: Unique identifier for your Firebase project (safe to expose)
- **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**: Domain for authentication
- **NEXT_PUBLIC_FIREBASE_PROJECT_ID**: Your Firebase project ID
- **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**: Cloud Storage bucket
- **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**: For Firebase Cloud Messaging
- **NEXT_PUBLIC_FIREBASE_APP_ID**: Unique app identifier

All variables prefixed with `NEXT_PUBLIC_` are safe to expose in the browser (and public repositories) as they identify your app, not contain secrets.
