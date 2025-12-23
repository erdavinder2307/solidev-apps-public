import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample app data
const sampleApps = [
  {
    id: 'app1',
    name: 'TaskMaster Pro',
    publisher: 'Productivity Solutions Inc.',
    iconUrl: 'https://via.placeholder.com/100x100/007bff/white?text=TM',
    rating: 4.5,
    reviews: 1247,
    screenshotUrls: [
      'https://via.placeholder.com/200x400/f8f9fa/6c757d?text=Screenshot+1',
      'https://via.placeholder.com/200x400/e9ecef/495057?text=Screenshot+2',
      'https://via.placeholder.com/200x400/dee2e6/343a40?text=Screenshot+3',
      'https://via.placeholder.com/200x400/ced4da/212529?text=Screenshot+4'
    ],
    description: 'TaskMaster Pro is the ultimate productivity app designed to help you organize your life, manage your tasks, and achieve your goals. With powerful features like smart scheduling, team collaboration, and AI-powered insights, you\'ll never miss a deadline again.',
    whatsNew: 'Version 2.1.0 brings dark mode support, improved performance, and new collaboration features. We\'ve also fixed several bugs and enhanced the user interface for better accessibility.',
    version: '2.1.0'
  }
];

// Sample reviews data
const sampleReviews = [
  {
    userId: 'user1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://via.placeholder.com/32x32/28a745/white?text=SJ',
    rating: 5,
    title: 'Amazing productivity booster!',
    comment: 'This app has completely transformed how I manage my daily tasks. The AI suggestions are spot-on and the interface is incredibly intuitive. Highly recommended!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    helpfulCount: 15,
    appVersion: '2.1.0',
    deviceInfo: 'iPhone 14 Pro'
  },
  {
    userId: 'user2',
    userName: 'Michael Chen',
    userAvatar: '',
    rating: 4,
    title: 'Great app with minor issues',
    comment: 'Love the features and the clean design. The collaboration tools work well with my team. However, I\'ve noticed some lag when syncing large projects. Overall, still worth the download!',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    helpfulCount: 8,
    appVersion: '2.0.5',
    deviceInfo: 'Samsung Galaxy S23'
  },
  {
    userId: 'user3',
    userName: 'Emily Rodriguez',
    userAvatar: 'https://via.placeholder.com/32x32/dc3545/white?text=ER',
    rating: 5,
    title: 'Perfect for team projects',
    comment: 'Our entire team switched to TaskMaster Pro and productivity has increased significantly. The real-time collaboration features are excellent.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    helpfulCount: 22,
    appVersion: '2.1.0',
    deviceInfo: 'iPad Air'
  },
  {
    userId: 'user4',
    userName: 'David Wilson',
    userAvatar: '',
    rating: 3,
    title: 'Good but could be better',
    comment: 'The app has potential but needs more customization options. The notification system could also use some work.',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    helpfulCount: 3,
    appVersion: '2.0.5',
    deviceInfo: 'Pixel 7'
  },
  {
    userId: 'user5',
    userName: 'Jessica Taylor',
    userAvatar: 'https://via.placeholder.com/32x32/6f42c1/white?text=JT',
    rating: 5,
    title: 'Life-changing app!',
    comment: 'I\'ve tried dozens of productivity apps, and this is by far the best. The smart scheduling feature is incredible and saves me hours of planning.',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    helpfulCount: 31,
    appVersion: '2.1.0',
    deviceInfo: 'iPhone 13'
  },
  {
    userId: 'user6',
    userName: 'Alex Thompson',
    userAvatar: '',
    rating: 4,
    title: 'Solid productivity tool',
    comment: 'Great app overall. The interface is clean and the features are well thought out. Would like to see more integration options with other apps.',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    helpfulCount: 7,
    appVersion: '2.0.5',
    deviceInfo: 'OnePlus 11'
  },
  {
    userId: 'user7',
    userName: 'Maria Garcia',
    userAvatar: 'https://via.placeholder.com/32x32/fd7e14/white?text=MG',
    rating: 2,
    title: 'Has bugs that need fixing',
    comment: 'The app crashes frequently on my device and some features don\'t work as expected. Customer support was helpful though.',
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    helpfulCount: 1,
    appVersion: '2.0.3',
    deviceInfo: 'Xiaomi Mi 12'
  },
  {
    userId: 'user8',
    userName: 'Robert Kim',
    userAvatar: '',
    rating: 5,
    title: 'Excellent for business use',
    comment: 'We\'ve been using this app for our startup and it\'s been instrumental in keeping everyone organized and on track. The reporting features are particularly useful.',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    helpfulCount: 19,
    appVersion: '2.1.0',
    deviceInfo: 'MacBook Pro'
  }
];

async function populateFirestore() {
  try {
    console.log('Starting to populate Firestore...');

    // Add sample app
    const appRef = doc(db, 'apps', sampleApps[0].id);
    await setDoc(appRef, sampleApps[0]);
    console.log('App data added successfully');

    // Add sample reviews
    const reviewsRef = collection(db, 'apps', sampleApps[0].id, 'reviews');
    for (const review of sampleReviews) {
      await addDoc(reviewsRef, review);
    }
    console.log('Reviews added successfully');

    console.log('Firestore population completed!');
    console.log(`Added 1 app with ${sampleReviews.length} reviews`);

  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

// Run the population script
populateFirestore();
