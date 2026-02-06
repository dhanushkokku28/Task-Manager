# 🚀 Vercel Deployment Guide

This guide will walk you through deploying the Task Management App to Vercel.

## Prerequisites

- GitHub account with your repository
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Firebase project configured with Firestore

## Step-by-Step Deployment

### 1. Prepare Your GitHub Repository

Make sure all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Complete task management app with all features"
git push origin main
```

### 2. Create Vercel Account

If you don't have one:
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 3. Import Project to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Find your `task-management-app` repository
4. Click "Import"

### 4. Configure Environment Variables

After clicking Import, you'll see the "Configure Project" screen:

1. Expand the "Environment Variables" section
2. Add each variable from your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBlkSzxzLwwKLwkrP5UdJIVMQ8DFfG1nCE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = task-management-app-817af.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = task-management-app-817af
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = task-management-app-817af.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 944877142026
NEXT_PUBLIC_FIREBASE_APP_ID = 1:944877142026:web:ad799ef652dce5780cdff3
```

3. Click "Deploy"

### 5. Wait for Deployment

- Vercel will build and deploy your app
- You'll see a progress indicator
- Once complete, you'll get a live URL (e.g., `https://task-management-app.vercel.app`)

### 6. Configure Firebase for Production

After deployment, update your Firebase project:

1. **Add Vercel Domain to Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Authentication → Settings → Authorized domains
   - Click "Add domain"
   - Add your Vercel URL (e.g., `task-management-app.vercel.app`)
   - Click "Save"

2. **Update Firestore Security Rules**
   - Go to Firestore Database → Rules
   - Replace with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow read only if task belongs to user
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Allow create only if userId matches auth user
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.title != null &&
                       request.resource.data.title != "";
      
      // Allow update only if task belongs to user
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // Allow delete only if task belongs to user
      allow delete: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

### 7. Test Your Deployment

1. Open your Vercel URL in a browser
2. Test the signup flow:
   - Click "Sign up"
   - Create a new account
   - Verify you're redirected to dashboard
3. Test task creation:
   - Click "Create New Task"
   - Add a task with title and description
   - Verify it appears in the list
4. Test filtering:
   - Change status to different values
   - Use the search box
   - Sort by different options
5. Test task editing:
   - Click "Edit" on a task
   - Change some details
   - Verify changes are saved

## Continuous Deployment

After initial setup, Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically detects the push and deploys
# No additional steps needed!
```

## Monitoring & Analytics

### Vercel Dashboard
- View deployment history
- Check build times
- Monitor edge function performance
- See analytics

### Firebase Console
- Check Firestore usage
- Monitor authentication activity
- Review security rules in action

## Troubleshooting Deployment

### Issue: Build Fails on Vercel

**Error:** `npm ERR! code ENOENT`

**Solution:**
1. Ensure all dependencies are in `package.json`
2. Run locally: `npm run build`
3. Fix any errors locally first
4. Push to GitHub again

### Issue: Firebase Authentication Not Working

**Error:** "Redirect URI not registered"

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Check "Authorized domains" includes your Vercel URL
3. Add the domain if missing

### Issue: Tasks Not Showing After Login

**Error:** Empty task list or 403 Firestore errors

**Solution:**
1. Check Firestore security rules are published
2. Verify userId field matches auth.uid
3. Check browser console for error messages
4. Try creating a new task

### Issue: Environment Variables Not Loading

**Error:** Firebase config is undefined

**Solution:**
1. Go to Vercel Project Settings → Environment Variables
2. Verify all variables are set
3. Redeploy: Click "Redeploy" on latest deployment
4. Wait for rebuild to complete

## Performance Optimization

### Vercel Features to Enable

1. **Web Analytics** (Optional)
   - Vercel Dashboard → Analytics
   - View user analytics

2. **Edge Functions** (Optional)
   - Add middleware for custom logic
   - Improve performance with edge caching

3. **Speed Insights**
   - Vercel Dashboard → Metrics
   - Monitor Core Web Vitals

## Security Checklist

Before going live, verify:

- ✅ All Firebase credentials are environment variables
- ✅ No secrets in git repository
- ✅ Firestore security rules are production-ready
- ✅ Firebase domain whitelist includes Vercel URL
- ✅ HTTPS is enabled (automatic on Vercel)
- ✅ Error messages don't expose sensitive info

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Project Settings → Domains
2. Enter your domain name
3. Follow DNS configuration instructions
4. Update Firebase authorized domains with custom domain

## Rollback Previous Deployment

If something goes wrong:

1. Go to Vercel Deployments
2. Find the previous working deployment
3. Click the three dots → "Promote to Production"
4. The previous version is now live

## Environment-Specific Deployments

### Preview Deployments
- Automatically created for pull requests
- Test changes before merging
- Share links with team

### Production Deployment
- Deployed when you merge to main
- Uses production Firebase rules
- Visible to all users

## Monitoring Errors

Enable error tracking:

1. **Vercel Error Tracking** (Built-in)
   - Automatically captures runtime errors
   - View in Vercel Dashboard

2. **Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Copy error messages for debugging

## Performance Metrics

After deployment, check:

1. **Lighthouse Score** (Target: 90+)
   - Vercel Analytics shows this
   - Or use [PageSpeed Insights](https://pagespeed.web.dev)

2. **Core Web Vitals**
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

3. **Load Time**
   - First Contentful Paint: < 1.8s
   - Fully loaded: < 3.5s

## Next Steps After Deployment

1. Share your live URL with others
2. Gather user feedback
3. Monitor analytics and errors
4. Plan future enhancements
5. Consider upgrading Firebase plan if needed

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Firebase Hosting Alternatives](https://firebase.google.com/docs/hosting)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

**🎉 Congratulations! Your app is now live on Vercel!**

Share your URL and start managing tasks!
