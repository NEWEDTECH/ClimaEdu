import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import serviceAccount from "./firebase-credentials.json";

let adminApp: App;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // In development or when credentials are not available, use without service account
    if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PRIVATE_KEY) {
      // Set emulator host for development BEFORE initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.log('✅ Initializing Firebase Admin with service account');
      // In production, use service account credentials
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      adminApp = initializeApp({
        credential: cert(serviceAccount as unknown as object),
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

// Get Firebase Admin services
function getAdminAuth() {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return getAuth(adminApp);
}

function getAdminFirestore() {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return getFirestore(adminApp);
}

function getAdminStorage() {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return getStorage(adminApp);
}

export { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore, getAdminStorage };
