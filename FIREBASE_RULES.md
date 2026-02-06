# Firebase Security Rules

These rules ensure that users can only access their own tasks.

Copy this entire content and paste it into your Firebase Console under:
**Firestore Database → Rules → Edit Rules**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Rules for tasks collection
    match /tasks/{taskId} {
      // Allow users to read their own tasks
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Allow users to create tasks (must set userId to their own UID)
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.title != null;
      
      // Allow users to update their own tasks
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // Allow users to delete their own tasks
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

## Important Notes

1. **Test Mode Transition**: If using Firebase's "test mode", remember to update these rules before production deployment
2. **Performance**: These rules only fetch documents that match the user's UID, improving performance
3. **Data Validation**: Consider adding more validation rules in production (e.g., max title length, valid status values)

## Enhanced Security Rules (Optional)

For more security, use these rules that also validate the data structure:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.title is string &&
                       request.resource.data.title.size() > 0 &&
                       request.resource.data.title.size() <= 100 &&
                       request.resource.data.status in ['todo', 'in-progress', 'done'] &&
                       request.resource.data.createdAt is timestamp &&
                       request.resource.data.updatedAt is timestamp;
      
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.userId == resource.data.userId &&
                       request.resource.data.createdAt == resource.data.createdAt &&
                       request.resource.data.title is string &&
                       request.resource.data.title.size() > 0 &&
                       request.resource.data.title.size() <= 100 &&
                       request.resource.data.status in ['todo', 'in-progress', 'done'] &&
                       request.resource.data.updatedAt is timestamp;
      
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
