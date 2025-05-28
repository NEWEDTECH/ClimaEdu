import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // In development, we can use the emulator without service account
    if (process.env.NODE_ENV === 'development') {
      // Set emulator host for development BEFORE initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // In production, use service account credentials
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
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

export { initializeFirebaseAdmin, getAdminAuth, getAdminFirestore };
