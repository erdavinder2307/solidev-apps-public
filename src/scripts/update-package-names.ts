import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing!');
  console.error('Create a .env file in src/scripts/ directory.');
  console.error('See .env.example for required variables.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Package name mappings for existing apps (using actual Firestore document IDs)
const packageNameMappings: { [key: string]: string } = {
  'HCTxiRkvyUCePc3NICSX': 'org.solidevelectrosoft.solidcare',  // Solidcare - Healthcare
  'mxWfAVLImCGoZVhkxYeU': 'com.solidevelectrosoft.solidtrack', // SolidTrack App
  'B0G079HRdbg5fDcyXCOS': 'com.solidevelectrosoft.decidematepro', // DecideMate Pro
};

async function updatePackageNames() {
  try {
    console.log('Starting to update package names...');
    
    const appsRef = collection(db, 'apps');
    const snapshot = await getDocs(appsRef);
    
    let updateCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const appId = docSnapshot.id;
      const packageName = packageNameMappings[appId];
      
      if (packageName) {
        const appDocRef = doc(db, 'apps', appId);
        await updateDoc(appDocRef, { packageName });
        console.log(`✓ Updated ${appId} with packageName: ${packageName}`);
        updateCount++;
      } else {
        console.log(`- Skipped ${appId} (no mapping found)`);
      }
    }
    
    console.log(`\n✓ Successfully updated ${updateCount} app(s) with package names`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating package names:', error);
    process.exit(1);
  }
}

updatePackageNames();
