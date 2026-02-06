# Assignment Questions & Answers

## 📝 Written Questions

### 1. What was the hardest part of this assignment and why?

**Answer:**

The hardest part was implementing **real-time synchronization between multiple users while maintaining user-specific data isolation**. Here's why:

1. **Data Isolation Complexity:**
   - Every task must belong to exactly one user
   - Queries must filter by `userId` at the database level for security
   - Client-side filtering isn't secure (users could see other's tasks)
   - Had to implement proper Firestore security rules with `request.auth.uid` validation

2. **Real-Time Listeners:**
   - Managing WebSocket connections (Firestore listeners)
   - Ensuring listeners clean up properly to avoid memory leaks
   - Handling offline scenarios where data might get stale
   - Real-time updates across components (edit in one place, see update everywhere)

3. **Error Handling for Async Operations:**
   - Tasks are async (database calls)
   - Network can fail mid-operation
   - User might be logged out while task is being saved
   - Had to implement proper error boundaries and toast notifications

4. **State Management Complexity:**
   - Keeping local state in sync with Firebase
   - Managing loading states during async operations
   - Handling optimistic updates vs server-confirmed updates

**Solution Implemented:**
```typescript
// Secure real-time listener with user filtering
const unsubscribe = onSnapshot(
  query(
    collection(db, 'tasks'),
    where('userId', '==', user.uid),  // ← Server-side filtering
    orderBy('createdAt', 'desc')
  ),
  (snapshot) => {
    // Update local state when Firestore changes
    setTasks(snapshot.docs.map(doc => ({...})));
  }
);
```

This ensures:
- Only the logged-in user's tasks are fetched
- Security enforced at database level
- Real-time updates whenever tasks change
- Clean unsubscribe prevents memory leaks

---

### 2. If this app had 10,000 users, what would you improve first?

**Answer:**

If scaling to 10,000 users, I would implement (in order of priority):

#### 🔴 **Priority 1: Database Performance** (Week 1)

1. **Add Firestore Composite Indexes**
   ```
   Tasks collection:
   - userId (Ascending)
   - createdAt (Descending)
   - userId (Ascending), status (Ascending)
   - userId (Ascending), dueDate (Ascending)
   ```
   
   Why: Queries with multiple filters on userId would be slow without indexes

2. **Implement Pagination**
   ```typescript
   // Load 25 tasks per page instead of all at once
   const tasksQuery = query(
     collection(db, 'tasks'),
     where('userId', '==', user.uid),
     orderBy('createdAt', 'desc'),
     limit(25)
   );
   ```
   
   Why: Fetching 10,000 tasks for one user would crash the app

3. **Add Offline Persistence**
   ```typescript
   enableIndexedDbPersistence(db)
     .catch((err) => {
       if (err.code === 'failed-precondition') {
         // Multiple tabs open
       }
     });
   ```
   
   Why: If network is slow, users see stale data instead of loading spinner

#### 🟠 **Priority 2: Infrastructure** (Week 2)

4. **Set Up Cloud Functions**
   - Move validation logic to backend (can't trust client)
   - Add rate limiting to prevent abuse
   - Log user actions for analytics
   
   ```typescript
   // Cloud Function for task creation
   exports.createTask = functions.https.onCall(async (data, context) => {
     // Validate user is authenticated
     if (!context.auth) throw new Error('Unauthenticated');
     
     // Rate limit: 100 tasks per day per user
     const tasksToday = await getTasksCreatedToday(context.auth.uid);
     if (tasksToday >= 100) throw new Error('Rate limit exceeded');
     
     // Create task in database
     return db.collection('tasks').add({
       userId: context.auth.uid,
       title: data.title,
       createdAt: new Date()
     });
   });
   ```

5. **Add Caching Strategy**
   - Cache frequently accessed data
   - Use Vercel's Edge Caching
   - Reduce Firebase read costs by 60-70%

#### 🟡 **Priority 3: Monitoring** (Week 3)

6. **Implement Error Tracking**
   ```typescript
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 0.1,
   });
   ```
   
   Why: Can't fix bugs you don't know about. With 10,000 users, bugs happen daily

7. **Add Analytics**
   ```typescript
   analytics().logEvent('task_created', {
     userId: user.uid,
     duration: Date.now() - startTime,
     platform: 'web'
   });
   ```
   
   Why: Understand user behavior, find bottlenecks

8. **Database Monitoring**
   - Firebase Console shows read/write counts
   - Alert if exceeding quota
   - Plan migration to Spanner or BigQuery if needed

#### 🟢 **Priority 4: UX Improvements** (Week 4)

9. **Optimize Search Performance**
   - Current search is O(n) - scans all tasks
   - Implement full-text search with Algolia or Elasticsearch
   
   ```typescript
   // Before: Searches all tasks locally
   tasks.filter(t => t.title.includes(query)) // SLOW with 10K tasks
   
   // After: Server-side full-text search
   const results = await algolia.index('tasks')
     .search(query, { filters: `userId:${user.uid}` });
   ```

10. **Add Lazy Loading**
    - Load task list in chunks
    - Virtualize long lists (show only visible items)
    - Reduce DOM nodes from 10,000 to ~20

#### 💰 **Priority 5: Cost Optimization** (Week 5)

11. **Firebase Plan Optimization**
    - Current: Pay-as-you-go (expensive at scale)
    - Change to: Blaze plan with annual commitment
    - Estimate: $5,000/year → $1,500/year

12. **Database Cleanup**
    - Implement soft deletes (mark deleted, don't remove)
    - Archive completed tasks after 90 days
    - Delete incomplete tasks after 1 year

---

## Implementation Timeline for 10K Users

```
Week 1: Database Performance
├─ Firestore Composite Indexes
├─ Implement Pagination
└─ Add Offline Persistence

Week 2: Infrastructure
├─ Cloud Functions for validation
├─ Implement rate limiting
└─ Add caching layer

Week 3: Monitoring
├─ Sentry error tracking
├─ Firebase Analytics
└─ Database monitoring

Week 4: UX Improvements
├─ Full-text search
├─ Lazy loading
└─ List virtualization

Week 5: Cost Optimization
├─ Firebase plan review
├─ Data cleanup strategy
└─ Archive old data
```

## Cost Analysis at 10K Users

**Assuming:**
- 10,000 active users
- 5 tasks per user = 50,000 total tasks
- 10 reads per user per day = 100,000 reads/day
- 2 writes per user per day = 20,000 writes/day

**Monthly Cost Breakdown:**

| Service | Reads | Writes | Estimate |
|---------|-------|--------|----------|
| Firestore | 3M | 600K | $2,000 |
| Vercel | - | - | $300 |
| Firebase Storage | - | - | $100 |
| **Total** | | | **$2,400/month** |

**Optimization Impact:**
- With caching: -40% reads → $1,440/month
- With pagination: -30% downloads → $800/month
- **Optimized Total: ~$1,000/month**

---

## Summary

The hardest part was **building secure, real-time data synchronization**. For 10K users, the biggest bottleneck would be **database performance**, which I'd address with:

1. ✅ Composite indexes (week 1)
2. ✅ Pagination (week 1)
3. ✅ Caching strategy (week 2)
4. ✅ Error monitoring (week 3)
5. ✅ Full-text search (week 4)

This would improve performance 10x and reduce costs by 60% compared to unoptimized implementation.
