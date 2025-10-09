# Firebase Database Setup for Profile Data

## Overview
This project now saves all profile data directly to Firebase Firestore database instead of the backend API.

## What Was Implemented

### 1. **Profile Data Storage**
All profile information is now stored in Firestore under the `profiles` collection:
- **Collection**: `profiles`
- **Document ID**: User's Firebase Auth UID
- **Fields**:
  - `name`: User's full name
  - `email`: User's email address
  - `phone`: Phone number
  - `location`: User's location
  - `experience`: Experience level (e.g., "1-3 years")
  - `jobPreferences`: Array of job preference strings
  - `userId`: Firebase Auth UID (for reference)
  - `createdAt`: ISO timestamp of profile creation
  - `updatedAt`: ISO timestamp of last update

### 2. **Updated Files**

#### `src/pages/Profile.tsx`
- **Load Profile**: Automatically loads profile data from Firestore on component mount
- **Save Profile**: Saves all profile fields to Firestore with one click
- **Real-time Updates**: Shows loading state and success/error toasts
- **Authentication Check**: Ensures user is logged in before operations

#### `src/lib/profile.ts` (NEW)
Created helper functions for profile operations:
- `getProfile(userId)`: Fetches user profile from Firestore
- `saveProfile(userId, profileData)`: Saves/updates profile with timestamps
- `updateProfile(userId, updates)`: Updates specific profile fields

### 3. **Security Rules**

#### `firestore.rules` (NEW)
Implemented secure Firestore rules:
- Users can only read/write their own profile data
- Authentication required for all operations
- Prevents userId tampering
- Includes rules for future collections (interviews, resumes, aptitude tests)

#### `firebase.json`
Updated to include Firestore configuration:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## How to Deploy Firestore Rules

To deploy the security rules to your Firebase project:

```bash
cd interviewer
firebase deploy --only firestore:rules
```

Or deploy everything at once:
```bash
firebase deploy
```

## Data Structure Example

```javascript
// profiles/{userId}
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  location: "San Francisco, CA",
  experience: "3-5 years",
  jobPreferences: ["Software Engineer", "Full Stack Developer", "Remote"],
  userId: "abc123xyz789",
  createdAt: "2025-01-15T10:30:00.000Z",
  updatedAt: "2025-01-20T14:45:00.000Z"
}
```

## Features

✅ **Automatic Loading**: Profile data loads automatically when visiting the profile page  
✅ **Real-time Feedback**: Toast notifications for save success/failure  
✅ **Loading States**: Shows spinner while loading profile data  
✅ **Error Handling**: Graceful error handling with user-friendly messages  
✅ **Security**: Firestore rules ensure users can only access their own data  
✅ **Timestamps**: Automatic tracking of creation and update times  
✅ **Merge Updates**: Uses merge mode to preserve existing data during updates  

## Testing

1. **Login**: Make sure you're logged in with Firebase Authentication
2. **View Profile**: Navigate to `/profile`
3. **Edit Fields**: Update any profile fields (name, phone, location, etc.)
4. **Add Preferences**: Add job preferences by typing and clicking the + button
5. **Save**: Click the "Save Profile" button
6. **Verify**: Refresh the page to confirm data persists

## Firebase Console

To view saved profile data:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Look for the `profiles` collection
5. Each document represents one user's profile

## Future Enhancements

Consider adding:
- Profile picture upload (using Firebase Storage)
- Additional fields (skills, education, certifications)
- Profile completion percentage
- Data export functionality
- Profile sharing/visibility settings

## Troubleshooting

**Profile won't save:**
- Check browser console for errors
- Verify Firebase is initialized properly
- Ensure `.env` file has correct Firebase credentials
- Deploy Firestore rules: `firebase deploy --only firestore:rules`

**Permission Denied errors:**
- Make sure user is logged in
- Verify Firestore rules are deployed
- Check that the document ID matches the user's UID

**Data not loading:**
- Check if profile exists in Firestore console
- Verify Firebase Auth is working
- Check browser console for errors
