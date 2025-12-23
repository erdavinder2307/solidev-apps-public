#!/usr/bin/env ts-node

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Firebase configuration - you'll need to replace this with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Category data to populate
const categoriesData = [
  {
    id: 'games',
    name: 'Games',
    icon: 'fas fa-gamepad',
    color: '#FF6B6B',
    description: 'Discover exciting games and entertainment apps'
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: 'fas fa-briefcase',
    color: '#4ECDC4',
    description: 'Get more done with powerful productivity tools'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'fas fa-play-circle',
    color: '#45B7D1',
    description: 'Movies, music, streaming and entertainment apps'
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'fas fa-graduation-cap',
    color: '#FFA07A',
    description: 'Learn new skills with educational apps and courses'
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: 'fas fa-heart',
    color: '#98D8C8',
    description: 'Stay healthy and fit with wellness apps'
  },
  {
    id: 'social',
    name: 'Social',
    icon: 'fas fa-users',
    color: '#F7DC6F',
    description: 'Connect with friends and social networking apps'
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: 'fas fa-camera',
    color: '#BB8FCE',
    description: 'Capture and edit photos with creative tools'
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'fas fa-plane',
    color: '#85C1E9',
    description: 'Plan trips and explore the world'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'fas fa-shopping-cart',
    color: '#F8C471',
    description: 'Shop online with the best shopping apps'
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'fas fa-chart-line',
    color: '#82E0AA',
    description: 'Manage your business and professional tasks'
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: 'fas fa-home',
    color: '#F1948A',
    description: 'Improve your daily life with lifestyle apps'
  },
  {
    id: 'news',
    name: 'News',
    icon: 'fas fa-newspaper',
    color: '#AED6F1',
    description: 'Stay informed with news and current events'
  }
];

async function populateCategories() {
  console.log('🚀 Starting to populate categories...');
  
  try {
    for (const categoryData of categoriesData) {
      const categoryRef = doc(db, 'categories', categoryData.id);
      await setDoc(categoryRef, {
        name: categoryData.name,
        icon: categoryData.icon,
        color: categoryData.color,
        description: categoryData.description,
        appCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Added category: ${categoryData.name}`);
    }
    
    console.log('🎉 All categories have been successfully added to Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating categories:', error);
    process.exit(1);
  }
}

// Run the script
populateCategories();
