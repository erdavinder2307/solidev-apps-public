// Firebase configuration and initialization for Angular project
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
// DO NOT commit actual credentials to version control
// Set these values in your .env file
const firebaseConfig = {
  apiKey: process.env['FIREBASE_API_KEY'] || '',
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
  projectId: process.env['FIREBASE_PROJECT_ID'] || '',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: process.env['FIREBASE_APP_ID'] || '',
  measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || ''
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing. Please set environment variables.');
  console.error('See .env.example for required variables.');
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = getAnalytics(firebaseApp);
