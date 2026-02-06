# Deployment Guide

Deploy your Task Management App to Vercel for free!

## Prerequisites

- GitHub account with your project pushed
- Vercel account (free at https://vercel.com)
- Firebase project set up with Security Rules configured

## Step 1: Prepare Your Project

### Ensure Code is Committed
```bash
# Check git status
git status

# Commit all changes
git add .
git commit -m "feat: complete task management app"

# Push to GitHub
git push origin main
```

### Verify Build Locally
```bash
# Test production build
npm run build

# If build succeeds, you're ready to deploy
```

## Step 2: Connect to Vercel

### Option A: Using Vercel Dashboard (Recommended)
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Search for your GitHub repository
4. Click **Import**
5. Vercel will auto-detect Next.js configuration
6. Click **Deploy** (no build configuration needed)

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from project directory
vercel

# Follow the prompts to connect your GitHub account
```

## Step 3: Add Environment Variables

### In Vercel Dashboard
1. Go to your project settings
2. Click **Environment Variables** (or Settings → Environment Variables)
3. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. **Save**
5. **Redeploy** to apply environment variables

## Step 4: Configure Firebase

### Update Authorized Domains
1. Go to Firebase Console → **Build → Authentication**
2. Click **Settings** (gear icon in top-right)
3. Go to **Authorized domains** tab
4. Add your Vercel domain (e.g., `my-app.vercel.app`)
5. Save

### Configure Firestore Rules
Ensure your Firestore Security Rules are properly configured:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 5: Verify Deployment

1. Visit your Vercel app URL (format: `https://your-project-name.vercel.app`)
2. Test the application:
   - Sign up with a new account
   - Create a task
   - Verify task appears in Firestore
   - Test logout and login
   - Test filtering and sorting

## Step 6: Configure Production Monitoring (Optional)

### Enable Vercel Analytics
1. In Vercel dashboard, go to **Analytics**
2. Enable **Web Analytics**
3. Monitor performance metrics

### Setup Error Tracking
1. In Vercel dashboard, go to **Monitoring**
2. Configure error alerts for your team

## Custom Domain (Optional)

### Add Custom Domain
1. In Vercel dashboard, go to **Settings → Domains**
2. Click **Add Domain**
3. Enter your custom domain
4. Follow instructions to update DNS records
5. Wait for DNS propagation (up to 24 hours)

### Update Firebase Authorized Domains
Remember to add your custom domain to Firebase's authorized domains list.

## Continuous Deployment

Your app now automatically deploys when you:
- Push to the `main` branch
- Create a pull request (preview deployment)
- Merge pull requests to `main`

### Disable Auto-deploy (Not Recommended)
1. Go to **Settings → Git**
2. Toggle **Automatic deployments** to off
3. Deploy manually from **Deployments** tab

## Environment-Specific Configurations

### Development vs Production
Both use the same Firebase project for this example. For larger apps:
- Create separate Firebase projects for dev/prod
- Use different environment variables per Vercel environment

### Configure Per-Environment Variables
1. In Vercel dashboard, select **Environment**
2. Add variables for Preview, Production environments
3. Vercel will use appropriate values automatically

## Monitoring & Maintenance

### Check Deployment Status
1. Go to **Deployments** tab
2. View build logs, deployment history
3. Rollback to previous deployment if needed

### Enable Notifications
1. Go to **Settings → Notifications**
2. Configure email alerts for failed deployments
3. Get real-time updates on deployment status

## Common Issues & Solutions

### "Cannot find module" error after deployment
- Ensure all dependencies are in `package.json` (not just `package-lock.json`)
- Rebuild on Vercel: go to Deployments → Redeploy

### "Firebase configuration is missing" in production
- Verify environment variables are added in Vercel dashboard
- Check variable names match `.env.local`
- Redeploy after adding environment variables

### "Permission denied" creating tasks in production
- Verify Firestore Security Rules are published
- Check that your domain is authorized in Firebase
- Test in Incognito mode (clears browser cache)

### Slow performance on first load
- Normal for Vercel's cold start
- Subsequent loads will be much faster
- Use Vercel Analytics to monitor performance

## Update Deployment

### After Making Changes Locally
```bash
# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin main

# Vercel automatically deploys!
```

### Manual Redeploy
1. Go to Vercel dashboard
2. Click **Deployments**
3. Click **Redeploy** on any previous deployment
4. Or use Vercel CLI: `vercel --prod`

## Rollback to Previous Deployment

1. Go to **Deployments** tab in Vercel
2. Find the deployment you want to restore
3. Click **Promote to Production**
4. Confirm the rollback

## Free Tier Limits

Vercel's free tier includes:
- Unlimited deployments
- 100 GB bandwidth per month
- Serverless functions (up to 12 seconds execution)
- Includes preview deployments for pull requests

No credit card required!

---

**Your app is now live and automatically deployed with every push!**
