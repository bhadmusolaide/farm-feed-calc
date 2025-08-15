# Firebase Global Settings Troubleshooting Guide

## 🔥 Common Issue: Global Settings Not Syncing in Production

### Problem
When you change site settings in production, the changes only save locally on the device instead of syncing globally across all users and devices.

### Root Cause
This happens when Firebase environment variables are not properly configured in your production deployment.

## 🔧 Solution Steps

### Step 1: Verify Firebase Configuration

1. **Check if Firebase environment variables are set in production:**
   - For **Vercel**: Go to your project dashboard → Settings → Environment Variables
   - For **Netlify**: Go to Site settings → Environment variables
   - For **other platforms**: Check your deployment platform's environment variable settings

2. **Required Firebase environment variables:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### Step 2: Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app or create a new web app
6. Copy the configuration values from the `firebaseConfig` object

### Step 3: Configure Environment Variables in Production

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each Firebase environment variable
5. Redeploy your application

#### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings → Environment variables
4. Add each Firebase environment variable
5. Trigger a new deploy

#### For other platforms:
Refer to your platform's documentation for setting environment variables.

### Step 4: Verify Firestore Database Setup

1. In Firebase Console, go to Firestore Database
2. Create a database if you haven't already
3. Choose "Start in test mode" for now (you can secure it later)
4. Ensure the database is in the same region as your users

### Step 5: Test the Fix

1. Deploy your application with the new environment variables
2. Open your production site
3. Sign in to the settings page
4. Make a change to the site settings
5. Open the site in a different browser/device
6. Verify the changes are reflected globally

## 🔍 Debugging Steps

### Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for Firebase-related errors:
   - "Firebase: No Firebase App '[DEFAULT]' has been created"
   - "Firebase: Error (auth/invalid-api-key)"
   - "Firebase: Error (auth/project-not-found)"

### Check Network Tab
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to save settings
4. Look for failed requests to Firebase/Firestore

### Check Application Status
1. Go to Settings page
2. Look at the "Settings Status" section
3. It should show "Global (Firebase)" when working correctly
4. If it shows "Local (Device only)", Firebase is not configured properly

## 🚨 Common Error Messages

### "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solution:** Firebase environment variables are missing or incorrect.

### "Firebase: Error (auth/invalid-api-key)"
**Solution:** The `NEXT_PUBLIC_FIREBASE_API_KEY` is incorrect.

### "Firebase: Error (auth/project-not-found)"
**Solution:** The `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is incorrect.

### "Global settings not available - check Firebase connection"
**Solution:** Firebase is not properly initialized or Firestore database is not set up.

## ✅ Verification Checklist

- [ ] All 6 Firebase environment variables are set in production
- [ ] Firebase project exists and is active
- [ ] Firestore database is created and accessible
- [ ] Application has been redeployed after adding environment variables
- [ ] Browser console shows no Firebase errors
- [ ] Settings page shows "Global (Firebase)" status
- [ ] Changes sync across different browsers/devices

## 🔒 Security Notes

1. **Firestore Rules**: Update your Firestore security rules for production:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read global settings
       match /global_settings/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

2. **API Key Security**: Firebase API keys for web apps are safe to expose publicly as they're designed for client-side use.

## 📞 Still Need Help?

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify all environment variables are exactly as shown in Firebase Console
3. Ensure you've redeployed after adding environment variables
4. Try creating a new Firebase project if the current one has issues

## 🔄 Quick Fix Summary

**Most common solution:**
1. Copy Firebase config from Firebase Console
2. Add all 6 environment variables to your deployment platform
3. Redeploy your application
4. Test global settings functionality

This should resolve 90% of global settings sync issues in production.