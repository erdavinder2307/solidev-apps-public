#!/usr/bin/env ts-node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Firebase configuration - load from environment variables
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

// Sample featured apps with screenshots
const featuredAppsData = [
  {
    id: 'fittrack-pro',
    name: 'FitTrack Pro',
    publisher: 'HealthTech Solutions',
    category: 'Health & Fitness',
    categoryId: 'health',
    description: 'Track your fitness journey with comprehensive workout and nutrition monitoring. Features include workout planning, calorie tracking, progress charts, and social sharing.',
    version: '2.1.0',
    rating: 4.7,
    reviewsCount: 1250,
    downloads: 50000,
    iconUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=512&h=512&fit=crop&crop=center',
    iconThumbUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=256&h=256&fit=crop&crop=center',
    screenshotUrls: [
      'https://images.unsplash.com/photo-1611695434398-4f4b330623e6?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1573766064535-6d5d4e62bf9d?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=800&fit=crop&crop=center'
    ],
    apkUrl: 'https://example.com/fittrack-pro.apk',
    whatsNew: 'New workout templates, improved UI, bug fixes',
    releaseDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-08-15'),
    size: '25.4 MB',
    requiresAndroid: '6.0 and up',
    inAppPurchases: true,
    ageRating: 'Everyone',
    isFeatured: true,
    isTopRated: true,
    isNew: false,
    tags: ['fitness', 'health', 'workout', 'nutrition']
  },
  {
    id: 'photoeditor-studio',
    name: 'PhotoEditor Studio',
    publisher: 'Creative Apps Inc',
    category: 'Photography',
    categoryId: 'photography',
    description: 'Professional photo editing with advanced filters, effects, and AI-powered tools. Transform your photos with studio-quality results.',
    version: '3.2.1',
    rating: 4.5,
    reviewsCount: 2800,
    downloads: 120000,
    iconUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=512&h=512&fit=crop&crop=center',
    iconThumbUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=256&h=256&fit=crop&crop=center',
    screenshotUrls: [
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=800&fit=crop&crop=center'
    ],
    apkUrl: 'https://example.com/photoeditor-studio.apk',
    whatsNew: 'New AI filters, improved performance, batch editing',
    releaseDate: new Date('2023-11-20'),
    lastUpdated: new Date('2024-08-20'),
    size: '45.2 MB',
    requiresAndroid: '7.0 and up',
    inAppPurchases: true,
    ageRating: 'Everyone',
    isFeatured: true,
    isNew: false,
    isTopRated: false,
    tags: ['photo', 'editing', 'filters', 'ai']
  },
  {
    id: 'taskmaster-pro',
    name: 'TaskMaster Pro',
    publisher: 'Productivity Labs',
    category: 'Productivity',
    categoryId: 'productivity',
    description: 'Ultimate task management and project organization tool. Features include team collaboration, time tracking, and advanced analytics.',
    version: '1.8.5',
    rating: 4.8,
    reviewsCount: 980,
    downloads: 35000,
    iconUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=512&h=512&fit=crop&crop=center',
    iconThumbUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=256&h=256&fit=crop&crop=center',
    screenshotUrls: [
      'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551818255-e6e10975cd6d?w=400&h=800&fit=crop&crop=center'
    ],
    apkUrl: 'https://example.com/taskmaster-pro.apk',
    whatsNew: 'Team collaboration features, dark mode, performance improvements',
    releaseDate: new Date('2024-03-10'),
    lastUpdated: new Date('2024-08-25'),
    size: '18.7 MB',
    requiresAndroid: '6.0 and up',
    inAppPurchases: false,
    ageRating: 'Everyone',
    isFeatured: true,
    isNew: true,
    isTopRated: true,
    tags: ['productivity', 'tasks', 'organization', 'team']
  }
];

async function populateFeaturedApps() {
  console.log('Starting to populate featured apps...');
  
  try {
    for (const appData of featuredAppsData) {
      const docRef = doc(collection(db, 'apps'), appData.id);
      await setDoc(docRef, appData);
      console.log(`✓ Added featured app: ${appData.name}`);
    }
    
    console.log('\n🎉 Successfully populated all featured apps!');
    console.log(`📱 Added ${featuredAppsData.length} featured apps with screenshots`);
    
  } catch (error) {
    console.error('❌ Error populating featured apps:', error);
  }
}

// Run the script
populateFeaturedApps().then(() => {
  console.log('Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
