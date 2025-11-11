import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;
    const isDevelopment = process.env.NODE_ENV === 'development' && !isVercel;

    // Only use emulators in development mode
    if (isDevelopment) {
      // Set emulator host for development BEFORE initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

      console.log('🔧 Using Firebase emulators');
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.log('✅ Initializing Firebase Admin with service account credentials');

      // In production, build service account from environment variables
      // In development (if not using emulators), fall back to JSON file
      let serviceAccountConfig;

      if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Production: use environment variables (recommended for Vercel)
        console.log('📝 Loading credentials from environment variables');
        serviceAccountConfig = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
          universe_domain: "googleapis.com"
        };
      } else {
        // Fallback: use local JSON file (development only)
        console.log('📝 Loading credentials from firebase-credentials.json');
        try {
          // Dynamic import for local development
          // eslint-disable-next-line
          const serviceAccount = require("./firebase-credentials.json");
          serviceAccountConfig = serviceAccount;
        } catch (error) {
          console.error('❌ Failed to load firebase-credentials.json:', error);
          throw new Error('Firebase credentials not found. Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables or provide firebase-credentials.json file.');
        }
      }

      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      console.log(`🔒 Initializing Firebase Admin for project: ${projectId}`);

      adminApp = initializeApp({
        credential: cert(serviceAccountConfig as object),
        projectId: projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

      console.log('✅ Firebase Admin initialized successfully');
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
