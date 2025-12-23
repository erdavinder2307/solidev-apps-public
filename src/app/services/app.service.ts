import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  updateDoc, 
  increment,
  addDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  getDownloadURL 
} from 'firebase/storage';
import { firebaseApp } from '../firebase.config';
import { AuthService } from './auth.service';

export interface App {
  id?: string;
  name: string;
  publisher: string;
  category: string;
  categoryId?: string;
  description: string;
  version: string;
  rating: number;
  reviewsCount: number;
  downloads: number;
  iconUrl: string;
  iconThumbUrl?: string;
  screenshotUrls: string[];
  screenshotThumbUrls?: string[];
  featuredImageUrls?: string[];
  featuredImageThumbUrls?: string[];
  apkUrl: string;
  apkFileName?: string;
  packageName?: string; // Android package name (e.g., com.solidev.appname)
  whatsNew?: string;
  releaseDate: Date;
  lastUpdated: Date;
  size: string;
  requiresAndroid: string;
  inAppPurchases: boolean;
  containsAds: boolean;
  ageRating: string;
  contentRating?: string;
  developerWebsite?: string;
  privacyPolicy?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
  featured?: boolean;
  trending?: boolean;
  isPublished?: boolean;
  isTopRated?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isEditorChoice?: boolean;
  tags: string[];
  permissions?: string[];
  installing?: boolean;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  iconUrl?: string;
  appCount?: number;
  order?: number;
}

export interface Review {
  id?: string;
  appId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  helpfulCount: number;
  reportCount: number;
  appVersion?: string;
  deviceInfo?: string;
  verified?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  favorites: string[];
  downloads: string[];
  reviews: string[];
  createdAt: Date;
  lastLogin: Date;
}

// Cache interface for optimization
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private db = getFirestore(firebaseApp);
  private storage = getStorage(firebaseApp);
  
  // Cache system for performance optimization
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_DURATION = {
    CATEGORIES: 5 * 60 * 1000, // 5 minutes
    CATEGORY_APPS: 3 * 60 * 1000, // 3 minutes
    APP_COUNTS: 2 * 60 * 1000, // 2 minutes
    APPS: 5 * 60 * 1000 // 5 minutes
  };
  
  // Reactive state
  private appsSubject = new BehaviorSubject<App[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private featuredAppsSubject = new BehaviorSubject<App[]>([]);
  private categoryAppCountsSubject = new BehaviorSubject<Map<string, number>>(new Map());
  
  public apps$ = this.appsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public featuredApps$ = this.featuredAppsSubject.asObservable();
  public categoryAppCounts$ = this.categoryAppCountsSubject.asObservable();

  // Getter methods for immediate access to cached data
  get currentCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  get currentCategoryAppCounts(): Map<string, number> {
    return this.categoryAppCountsSubject.value;
  }

  get currentApps(): App[] {
    return this.appsSubject.value;
  }

  constructor(private authService: AuthService) {
    this.initializeData();
    
    // Add global methods for console access (development only)
    if (typeof window !== 'undefined') {
      (window as any).appService = {
        recalculateAllRatings: () => this.recalculateAllAppRatings(),
        fixStaticRatings: () => this.fixStaticRatings(),
        updateAppRating: (appId: string) => this.updateAppRatingFromReviews(appId),
        getAppWithReviews: (appId: string) => this.getAppRatingDetails(appId),
        checkAllAppRatings: () => this.checkAllAppRatings(),
        forceRefreshApps: () => this.forceRefreshApps(),
        syncReviewsToSubcollections: () => this.syncReviewsToSubcollections(),
        validateRatingSync: () => this.validateAllAppRatings()
      };
    }
  }

  // Cache helper methods
  private setCacheEntry<T>(key: string, data: T, duration: number): void {
    const expiresAt = Date.now() + duration;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    });
  }

  private getCacheEntry<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Public method to clear cache when needed
  clearAppCache(): void {
    this.clearCache();
  }

  // Method to force refresh of category app counts
  async refreshCategoryAppCounts(): Promise<Map<string, number>> {
    this.clearCache('category-app-counts');
    return this.getCategoryAppCounts();
  }

  // Method to force refresh of category apps
  async refreshCategoryApps(categoryId: string): Promise<App[]> {
    this.clearCache(`category-apps-${categoryId}`);
    return this.getAppsByCategory(categoryId);
  }

  private async initializeData() {
    try {
      await this.loadCategories();
      
      // Try to load apps - if this fails due to missing fields, we'll fix them
      const apps = await this.loadApps();
      
      // If no apps were loaded, it might be due to missing fields - try to fix existing data
      if (apps.length === 0) {
        // No apps loaded, checking for data integrity issues...
        try {
          await this.fixExistingAppsData();
          // Retry loading after fixing data
          await this.loadApps();
        } catch (error) {
          // Could not fix existing data
        }
      }
      
      // Auto-fix ratings on startup (run in background)
      setTimeout(async () => {
        try {
          // Auto-checking app ratings on startup...
          await this.fixStaticRatings();
          
          // Also validate that ratings are in sync
          const validationResults = await this.validateAllAppRatings();
          if (validationResults.length > 0) {
            // Found apps with rating inconsistencies. Running fix...
            for (const result of validationResults) {
              if (result.needsUpdate) {
                await this.updateAppRatingFromReviews(result.appId);
              }
            }
            // Fixed rating inconsistencies
          }
        } catch (error) {
          // Could not auto-fix ratings on startup
        }
      }, 2000); // Run after 2 seconds to not block initial load
      
    } catch (error) {
      // Error initializing data
    }
  }

  // ==================== APPS ====================
  
  async loadApps(): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      
      // First try to get all apps without ordering (in case some don't have downloads field)
      let snapshot;
      try {
        const appsQuery = query(appsCollection, orderBy('downloads', 'desc'));
        snapshot = await getDocs(appsQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get all apps without ordering
        snapshot = await getDocs(appsCollection);
      }
      
      const apps: App[] = snapshot.docs.map(doc => this.mapDocToApp(doc));
      
      // Sort apps by downloads in memory if Firestore ordering failed
      apps.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      
      this.appsSubject.next(apps);
      this.updateFeaturedApps(apps);
      
      return apps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getAppById(id: string): Promise<App | null> {
    try {
      const appDoc = doc(this.db, 'apps', id);
      const snapshot = await getDoc(appDoc);
      
      if (snapshot.exists()) {
        return this.mapDocToApp(snapshot);
      }
      return null;
    } catch (error) {
      // Production: Error logged
      return null;
    }
  }

  async getAppsByCategory(categoryId: string): Promise<App[]> {
    try {
      // Check cache first
      const cacheKey = `category-apps-${categoryId}`;
      const cachedApps = this.getCacheEntry<App[]>(cacheKey);
      if (cachedApps) {
        return cachedApps;
      }

      const appsCollection = collection(this.db, 'apps');
      let apps: App[] = [];
      
      // First try to get apps by categoryId
      let snapshot;
      try {
        const categoryQuery = query(
          appsCollection, 
          where('categoryId', '==', categoryId),
          orderBy('downloads', 'desc')
        );
        snapshot = await getDocs(categoryQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get apps without ordering
        const categoryQuery = query(
          appsCollection, 
          where('categoryId', '==', categoryId)
        );
        snapshot = await getDocs(categoryQuery);
      }
      
      apps = snapshot.docs.map(doc => this.mapDocToApp(doc));
      
      // If no apps found by categoryId, try to find by category name
      if (apps.length === 0) {
        // Get category name from categoryId
        const categoryDoc = await this.getCategoryById(categoryId);
        if (categoryDoc?.name) {
          try {
            const categoryNameQuery = query(
              appsCollection, 
              where('category', '==', categoryDoc.name)
            );
            const nameSnapshot = await getDocs(categoryNameQuery);
            
            const appsByName = nameSnapshot.docs.map(doc => this.mapDocToApp(doc));
            
            // Update these apps to include the categoryId for future efficiency
            for (const app of appsByName) {
              if (app.id) {
                this.updateAppCategoryId(app.id, categoryId).catch(error => 
                  console.warn(`Could not update categoryId for app ${app.id}:`, error)
                );
              }
            }
            
            apps = appsByName;
          } catch (error) {
            // Production: Warning logged
          }
        }
      }
      
      // Sort apps by downloads in memory
      apps.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      
      // Cache the results
      this.setCacheEntry(cacheKey, apps, this.CACHE_DURATION.CATEGORY_APPS);
      
      return apps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getCategoryAppCounts(): Promise<Map<string, number>> {
    try {
      // Check cache first
      const cacheKey = 'category-app-counts';
      const cachedCounts = this.getCacheEntry<Map<string, number>>(cacheKey);
      if (cachedCounts) {
        this.categoryAppCountsSubject.next(cachedCounts);
        return cachedCounts;
      }

      const appCounts = new Map<string, number>();
      
      // Get all apps in a single query
      const appsCollection = collection(this.db, 'apps');
      const snapshot = await getDocs(appsCollection);
      
      // Count apps per category - check both categoryId and category fields
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const categoryId = data['categoryId'];
        const categoryName = data['category'];
        
        // First try to match by categoryId
        if (categoryId) {
          const currentCount = appCounts.get(categoryId) || 0;
          appCounts.set(categoryId, currentCount + 1);
        } 
        // If no categoryId but has category name, try to match by name
        else if (categoryName) {
          // Find category ID by name (case-insensitive)
          const normalizedCategoryName = categoryName.toLowerCase().trim();
          let matchedCategoryId = null;
          
          // Map common category names to IDs
          const categoryNameToIdMap: { [key: string]: string } = {
            'games': 'games',
            'game': 'games',
            'gaming': 'games',
            'productivity': 'productivity',
            'entertainment': 'entertainment',
            'education': 'education',
            'educational': 'education',
            'health & fitness': 'health',
            'health': 'health',
            'fitness': 'health',
            'social': 'social',
            'photography': 'photography',
            'photo': 'photography',
            'travel': 'travel',
            'shopping': 'shopping',
            'business': 'business',
            'lifestyle': 'lifestyle',
            'news': 'news'
          };
          
          matchedCategoryId = categoryNameToIdMap[normalizedCategoryName];
          
          if (matchedCategoryId) {
            const currentCount = appCounts.get(matchedCategoryId) || 0;
            appCounts.set(matchedCategoryId, currentCount + 1);
            
            // Also update the app document to include the categoryId for future efficiency
            this.updateAppCategoryId(doc.id, matchedCategoryId).catch(error => 
              console.warn(`Could not update categoryId for app ${doc.id}:`, error)
            );
          }
        }
      });
      
      // Cache the results
      this.setCacheEntry(cacheKey, appCounts, this.CACHE_DURATION.APP_COUNTS);
      this.categoryAppCountsSubject.next(appCounts);
      
      return appCounts;
    } catch (error) {
      // Production: Error logged
      return new Map();
    }
  }

  // Helper method to update app with missing categoryId
  private async updateAppCategoryId(appId: string, categoryId: string): Promise<void> {
    try {
      const appDoc = doc(this.db, 'apps', appId);
      await updateDoc(appDoc, { categoryId });
      // Production: Log removed
    } catch (error) {
      // Production: Error logged
    }
  }

  async searchApps(searchTerm: string): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      const snapshot = await getDocs(appsCollection);
      
      const allApps = snapshot.docs.map(doc => this.mapDocToApp(doc));
      
      // Client-side filtering (for better search experience)
      const filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      return filteredApps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getFeaturedApps(limit: number = 5): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      
      let snapshot;
      try {
        const featuredQuery = query(
          appsCollection,
          where('isFeatured', '==', true),
          orderBy('downloads', 'desc'),
          firestoreLimit(limit)
        );
        snapshot = await getDocs(featuredQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get featured apps and sort in memory
        try {
          const featuredQuery = query(
            appsCollection,
            where('isFeatured', '==', true),
            firestoreLimit(limit * 2) // Get more to sort in memory
          );
          snapshot = await getDocs(featuredQuery);
          const apps = snapshot.docs.map(doc => this.mapDocToApp(doc));
          apps.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          return apps.slice(0, limit);
        } catch (error2) {
          // Production: Warning logged
          // Last resort: get all apps and filter/sort in memory
          const allAppsSnapshot = await getDocs(appsCollection);
          const allApps = allAppsSnapshot.docs.map(doc => this.mapDocToApp(doc));
          const featuredApps = allApps.filter(app => app.featured);
          featuredApps.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          return featuredApps.slice(0, limit);
        }
      }
      
      return snapshot.docs.map(doc => this.mapDocToApp(doc));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getTopApps(limit: number = 10): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      
      let snapshot;
      try {
        const topQuery = query(
          appsCollection,
          orderBy('rating', 'desc'),
          orderBy('downloads', 'desc'),
          firestoreLimit(limit)
        );
        snapshot = await getDocs(topQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get all apps and sort in memory
        const allAppsSnapshot = await getDocs(appsCollection);
        const allApps = allAppsSnapshot.docs.map(doc => this.mapDocToApp(doc));
        allApps.sort((a, b) => {
          if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
          return (b.downloads || 0) - (a.downloads || 0);
        });
        return allApps.slice(0, limit);
      }
      
      return snapshot.docs.map(doc => this.mapDocToApp(doc));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getTopRatedApps(limit: number = 10): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      
      let snapshot;
      try {
        const topRatedQuery = query(
          appsCollection,
          where('isTopRated', '==', true),
          orderBy('rating', 'desc'),
          orderBy('downloads', 'desc'),
          firestoreLimit(limit)
        );
        snapshot = await getDocs(topRatedQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get apps with isTopRated = true and sort in memory
        try {
          const topRatedQuery = query(
            appsCollection,
            where('isTopRated', '==', true),
            firestoreLimit(limit * 2) // Get more to sort in memory
          );
          snapshot = await getDocs(topRatedQuery);
          const apps = snapshot.docs.map(doc => this.mapDocToApp(doc));
          apps.sort((a, b) => {
            if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
            return (b.downloads || 0) - (a.downloads || 0);
          });
          return apps.slice(0, limit);
        } catch (error2) {
          // Production: Warning logged
          // Last resort: get all apps and filter/sort in memory
          const allAppsSnapshot = await getDocs(appsCollection);
          const allApps = allAppsSnapshot.docs.map(doc => this.mapDocToApp(doc));
          const topRatedApps = allApps.filter(app => app.isTopRated);
          topRatedApps.sort((a, b) => {
            if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
            return (b.downloads || 0) - (a.downloads || 0);
          });
          return topRatedApps.slice(0, limit);
        }
      }
      
      return snapshot.docs.map(doc => this.mapDocToApp(doc));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getNewApps(limit: number = 10): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      
      let snapshot;
      try {
        const newQuery = query(
          appsCollection,
          where('isNew', '==', true),
          orderBy('releaseDate', 'desc'),
          firestoreLimit(limit)
        );
        snapshot = await getDocs(newQuery);
      } catch (error) {
        // Production: Warning logged
        // If ordering fails, get new apps and sort in memory
        try {
          const newQuery = query(
            appsCollection,
            where('isNew', '==', true),
            firestoreLimit(limit * 2) // Get more to sort in memory
          );
          snapshot = await getDocs(newQuery);
          const apps = snapshot.docs.map(doc => this.mapDocToApp(doc));
          apps.sort((a, b) => (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0));
          return apps.slice(0, limit);
        } catch (error2) {
          // Production: Warning logged
          // Last resort: get all apps and filter/sort in memory
          const allAppsSnapshot = await getDocs(appsCollection);
          const allApps = allAppsSnapshot.docs.map(doc => this.mapDocToApp(doc));
          const newApps = allApps.filter(app => app.isNew);
          newApps.sort((a, b) => (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0));
          return newApps.slice(0, limit);
        }
      }
      
      return snapshot.docs.map(doc => this.mapDocToApp(doc));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async incrementDownloads(appId: string): Promise<void> {
    try {
      const appDoc = doc(this.db, 'apps', appId);
      await updateDoc(appDoc, {
        downloads: increment(1)
      });

      // Track user download if authenticated
      const user = this.authService.currentUser;
      if (user) {
        await this.addToUserDownloads(user.uid, appId);
      }
    } catch (error) {
      // Production: Error logged
    }
  }

  // ==================== CATEGORIES ====================
  
  async loadCategories(): Promise<Category[]> {
    try {
      // Check cache first
      const cacheKey = 'categories';
      const cachedCategories = this.getCacheEntry<Category[]>(cacheKey);
      if (cachedCategories) {
        this.categoriesSubject.next(cachedCategories);
        return cachedCategories;
      }

      const categoriesCollection = collection(this.db, 'categories');
      const snapshot = await getDocs(categoriesCollection);
      
      const categories: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      
      // Cache the results
      this.setCacheEntry(cacheKey, categories, this.CACHE_DURATION.CATEGORIES);
      
      this.categoriesSubject.next(categories);
      return categories;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryDoc = doc(this.db, 'categories', id);
      const snapshot = await getDoc(categoryDoc);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Category;
      }
      return null;
    } catch (error) {
      // Production: Error logged
      return null;
    }
  }

  // Populate initial categories in Firestore
  async populateInitialCategories(): Promise<void> {
    try {
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

      // Production: Log removed
      
      for (const categoryData of categoriesData) {
        const categoryRef = doc(this.db, 'categories', categoryData.id);
        await setDoc(categoryRef, {
          name: categoryData.name,
          icon: categoryData.icon,
          color: categoryData.color,
          description: categoryData.description,
          appCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Production: Log removed
      }
      
      // Production: Log removed
      
      // Note: Sample apps population removed - only real developer-submitted apps will be displayed
      // await this.populateSampleApps();
      
      // Reload categories after populating
      await this.loadCategories();
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Populate sample apps for each category
  async populateSampleApps(): Promise<void> {
    try {
      const sampleApps = [
        // Games Category
        {
          name: 'Super Adventure Quest',
          publisher: 'GameStudio Pro',
          category: 'Games',
          categoryId: 'games',
          description: 'Embark on an epic adventure in this thrilling action-packed game with stunning graphics and immersive gameplay.',
          iconUrl: 'https://via.placeholder.com/128x128/FF6B6B/FFFFFF?text=SAQ',
          iconThumbUrl: 'https://via.placeholder.com/64x64/FF6B6B/FFFFFF?text=SAQ',
          screenshotUrls: ['https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.5,
          reviewsCount: 1250,
          downloads: 50000,
          size: '45.2 MB',
          version: '2.1.0',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '5.0+',
          permissions: ['INTERNET', 'WRITE_EXTERNAL_STORAGE'],
          tags: ['adventure', 'action', 'game'],
          isFeatured: true,
          isTopRated: false,
          isNew: false,
          isEditorChoice: false,
          ageRating: 'Everyone',
          contentRating: 'E'
        },
        {
          name: 'Puzzle Master 3D',
          publisher: 'Brain Games Inc',
          category: 'Games',
          categoryId: 'games',
          description: 'Challenge your mind with hundreds of 3D puzzles and brain teasers.',
          iconUrl: 'https://via.placeholder.com/128x128/FF6B6B/FFFFFF?text=PM3D',
          iconThumbUrl: 'https://via.placeholder.com/64x64/FF6B6B/FFFFFF?text=PM3D',
          screenshotUrls: ['https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.2,
          reviewsCount: 890,
          downloads: 25000,
          size: '32.1 MB',
          version: '1.5.2',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '4.4+',
          permissions: ['INTERNET'],
          tags: ['puzzle', 'brain', 'game'],
          isFeatured: false,
          isTopRated: true,
          isNew: false,
          isEditorChoice: false,
          ageRating: 'Everyone',
          contentRating: 'E'
        },
        // Productivity Category
        {
          name: 'TaskMaster Pro',
          publisher: 'Productive Apps Ltd',
          category: 'Productivity',
          categoryId: 'productivity',
          description: 'The ultimate task management and productivity app for professionals and teams.',
          iconUrl: 'https://via.placeholder.com/128x128/4ECDC4/FFFFFF?text=TMP',
          iconThumbUrl: 'https://via.placeholder.com/64x64/4ECDC4/FFFFFF?text=TMP',
          screenshotUrls: ['https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.7,
          reviewsCount: 2100,
          downloads: 75000,
          size: '28.5 MB',
          version: '3.2.1',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '6.0+',
          permissions: ['INTERNET', 'CALENDAR', 'CONTACTS'],
          tags: ['productivity', 'tasks', 'business'],
          isFeatured: true,
          isTopRated: true,
          isNew: false,
          isEditorChoice: true,
          ageRating: 'Everyone',
          contentRating: 'E'
        },
        {
          name: 'Note Genius',
          publisher: 'Smart Notes Co',
          category: 'Productivity',
          categoryId: 'productivity',
          description: 'Smart note-taking app with AI-powered organization and search capabilities.',
          iconUrl: 'https://via.placeholder.com/128x128/4ECDC4/FFFFFF?text=NG',
          iconThumbUrl: 'https://via.placeholder.com/64x64/4ECDC4/FFFFFF?text=NG',
          screenshotUrls: ['https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.4,
          reviewsCount: 1560,
          downloads: 40000,
          size: '22.3 MB',
          version: '2.8.0',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '5.0+',
          permissions: ['INTERNET', 'WRITE_EXTERNAL_STORAGE'],
          tags: ['notes', 'productivity', 'ai'],
          isFeatured: false,
          isTopRated: false,
          isNew: true,
          isEditorChoice: false,
          ageRating: 'Everyone',
          contentRating: 'E'
        },
        // Entertainment Category
        {
          name: 'StreamFlix',
          publisher: 'Entertainment Hub',
          category: 'Entertainment',
          categoryId: 'entertainment',
          description: 'Stream your favorite movies and TV shows in high quality.',
          iconUrl: 'https://via.placeholder.com/128x128/45B7D1/FFFFFF?text=SF',
          iconThumbUrl: 'https://via.placeholder.com/64x64/45B7D1/FFFFFF?text=SF',
          screenshotUrls: ['https://via.placeholder.com/800x600/45B7D1/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.6,
          reviewsCount: 3200,
          downloads: 120000,
          size: '65.4 MB',
          version: '4.1.2',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '7.0+',
          permissions: ['INTERNET', 'WRITE_EXTERNAL_STORAGE', 'WAKE_LOCK'],
          tags: ['entertainment', 'streaming', 'movies'],
          isFeatured: true,
          isTopRated: true,
          isNew: false,
          isEditorChoice: true,
          ageRating: 'Teen',
          contentRating: 'T'
        },
        // Education Category
        {
          name: 'Learn Languages Fast',
          publisher: 'EduTech Solutions',
          category: 'Education',
          categoryId: 'education',
          description: 'Master new languages with interactive lessons and AI-powered practice.',
          iconUrl: 'https://via.placeholder.com/128x128/FFA07A/FFFFFF?text=LLF',
          iconThumbUrl: 'https://via.placeholder.com/64x64/FFA07A/FFFFFF?text=LLF',
          screenshotUrls: ['https://via.placeholder.com/800x600/FFA07A/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.8,
          reviewsCount: 1890,
          downloads: 60000,
          size: '58.7 MB',
          version: '5.3.1',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '6.0+',
          permissions: ['INTERNET', 'RECORD_AUDIO', 'CAMERA'],
          tags: ['education', 'languages', 'learning'],
          isFeatured: true,
          isTopRated: true,
          isNew: false,
          isEditorChoice: true,
          ageRating: 'Everyone',
          contentRating: 'E'
        },
        // Health Category
        {
          name: 'FitTracker Pro',
          publisher: 'Health & Wellness Inc',
          category: 'Health & Fitness',
          categoryId: 'health',
          description: 'Track your fitness goals, workouts, and health metrics with precision.',
          iconUrl: 'https://via.placeholder.com/128x128/98D8C8/FFFFFF?text=FTP',
          iconThumbUrl: 'https://via.placeholder.com/64x64/98D8C8/FFFFFF?text=FTP',
          screenshotUrls: ['https://via.placeholder.com/800x600/98D8C8/FFFFFF?text=Screenshot1'],
          apkUrl: '',
          rating: 4.5,
          reviewsCount: 1450,
          downloads: 35000,
          size: '41.2 MB',
          version: '2.9.0',
          releaseDate: new Date(),
          lastUpdated: new Date(),
          requiresAndroid: '5.0+',
          permissions: ['INTERNET', 'ACCESS_FINE_LOCATION', 'BODY_SENSORS'],
          tags: ['fitness', 'health', 'tracking'],
          isFeatured: false,
          isTopRated: true,
          isNew: false,
          isEditorChoice: false,
          ageRating: 'Everyone',
          contentRating: 'E'
        }
      ];

      // Production: Log removed
      
      for (const appData of sampleApps) {
        await addDoc(collection(this.db, 'apps'), {
          ...appData,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'published'
        });
        
        // Production: Log removed
      }
      
      // Production: Log removed
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // ==================== REVIEWS ====================
  
  async getAppReviews(appId: string, limitCount: number = 20): Promise<Review[]> {
    try {
      const allReviews: Review[] = [];

      // Get reviews from the app's subcollection first
      try {
        const appReviewsCollection = collection(this.db, 'apps', appId, 'reviews');
        const appReviewsQuery = query(
          appReviewsCollection,
          orderBy('createdAt', 'desc'),
          firestoreLimit(limitCount)
        );
        const appReviewsSnapshot = await getDocs(appReviewsQuery);
        
        const subCollectionReviews = appReviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()['createdAt']?.toDate() || new Date(),
          source: 'subcollection'
        } as Review & { source: string }));
        
        allReviews.push(...subCollectionReviews);
      } catch (subcollectionError) {
        // Production: Warning logged
      }

      // Also get reviews from the main collection
      try {
        const reviewsCollection = collection(this.db, 'reviews');
        const reviewsQuery = query(
          reviewsCollection,
          where('appId', '==', appId),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limitCount)
        );
        const mainReviewsSnapshot = await getDocs(reviewsQuery);
        
        const mainCollectionReviews = mainReviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data()['createdAt']?.toDate() || new Date(),
          source: 'main'
        } as Review & { source: string }));
        
        allReviews.push(...mainCollectionReviews);
      } catch (mainCollectionError) {
        // Production: Warning logged
      }

      // Remove duplicates (in case a review exists in both places)
      const uniqueReviews = allReviews.filter((review, index, self) => 
        index === self.findIndex(r => r.id === review.id)
      );

      // Sort by creation date and limit results
      uniqueReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return uniqueReviews.slice(0, limitCount);
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  // Calculate and update app rating based on reviews
  async updateAppRatingFromReviews(appId: string): Promise<void> {
    try {
      let totalRating = 0;
      let reviewCount = 0;

      // First, try to get reviews from the app's subcollection
      try {
        const appReviewsRef = collection(this.db, 'apps', appId, 'reviews');
        const appReviewsQuery = query(appReviewsRef);
        const appReviewsSnapshot = await getDocs(appReviewsQuery);
        
        appReviewsSnapshot.docs.forEach(doc => {
          const rating = doc.data()['rating'] || 0;
          if (rating > 0 && rating <= 5) {
            totalRating += rating;
            reviewCount++;
          }
        });
        
        // Production: Log removed
      } catch (subcollectionError) {
        // Production: Warning logged
      }

      // Also check the main reviews collection for additional reviews
      try {
        const reviewsRef = collection(this.db, 'reviews');
        const mainReviewsQuery = query(reviewsRef, where('appId', '==', appId));
        const mainReviewsSnapshot = await getDocs(mainReviewsQuery);
        
        mainReviewsSnapshot.docs.forEach(doc => {
          const rating = doc.data()['rating'] || 0;
          if (rating > 0 && rating <= 5) {
            totalRating += rating;
            reviewCount++;
          }
        });
        
        // Production: Log removed
      } catch (mainCollectionError) {
        // Production: Warning logged
      }

      const averageRating = reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0;
      
      // Update the app document in Firestore
      const appDoc = doc(this.db, 'apps', appId);
      await updateDoc(appDoc, { 
        rating: averageRating, 
        reviewsCount: reviewCount,
        lastRatingUpdate: new Date()
      });

      // Production: Log removed
      
      // Clear cache to force reload of updated data
      this.clearCache(`app-${appId}`);
      this.clearCache('featured-apps');
      this.clearCache('top-rated-apps');
      this.clearCache('apps');
      
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Recalculate ratings for all apps that have reviews
  async recalculateAllAppRatings(): Promise<void> {
    try {
      // Production: Log removed
      
      const appsCollection = collection(this.db, 'apps');
      const appsSnapshot = await getDocs(appsCollection);
      
      let updatedCount = 0;
      
      for (const appDoc of appsSnapshot.docs) {
        try {
          await this.updateAppRatingFromReviews(appDoc.id);
          updatedCount++;
        } catch (error) {
          // Production: Warning logged
        }
      }
      
      // Production: Log removed
      
      // Refresh the apps data
      await this.loadApps();
      
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Method to update apps with static ratings to use calculated ratings
  async fixStaticRatings(): Promise<void> {
    try {
      // Production: Log removed
      
      // Find apps that have reviews but might have static ratings
      const appsCollection = collection(this.db, 'apps');
      const appsSnapshot = await getDocs(appsCollection);
      
      let fixedCount = 0;
      
      for (const appDocSnap of appsSnapshot.docs) {
        const appId = appDocSnap.id;
        let hasReviews = false;
        
        // Check if this app has reviews in the subcollection
        try {
          const appReviewsRef = collection(this.db, 'apps', appId, 'reviews');
          const appReviewsSnapshot = await getDocs(appReviewsRef);
          if (appReviewsSnapshot.docs.length > 0) {
            hasReviews = true;
          }
        } catch (error) {
          // Subcollection might not exist, that's okay
        }

        // Also check the main reviews collection
        if (!hasReviews) {
          try {
            const reviewsRef = collection(this.db, 'reviews');
            const reviewsQuery = query(reviewsRef, where('appId', '==', appId));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            if (reviewsSnapshot.docs.length > 0) {
              hasReviews = true;
            }
          } catch (error) {
            // Production: Warning logged
          }
        }
        
        if (hasReviews) {
          // App has reviews, calculate rating from reviews
          await this.updateAppRatingFromReviews(appId);
          fixedCount++;
          // Production: Log removed
        }
      }
      
      // Production: Log removed
      
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Debug method to get app rating calculation details
  async getAppRatingDetails(appId: string): Promise<any> {
    try {
      // Get app details
      const app = await this.getAppById(appId);
      if (!app) {
        return { error: 'App not found' };
      }

      // Get all reviews for this app
      const reviews = await this.getAppReviews(appId, 100); // Get up to 100 reviews
      
      // Calculate rating details
      let totalRating = 0;
      let reviewCount = 0;
      const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      reviews.forEach(review => {
        if (review.rating > 0 && review.rating <= 5) {
          totalRating += review.rating;
          reviewCount++;
          ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
        }
      });

      const calculatedRating = reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0;

      const result = {
        appId,
        appName: app.name,
        currentStoredRating: app.rating,
        currentStoredReviewCount: app.reviewsCount,
        calculatedRating,
        actualReviewCount: reviewCount,
        ratingBreakdown,
        reviews: reviews.map(r => ({ rating: r.rating, title: r.title, userName: r.userName })),
        needsUpdate: app.rating !== calculatedRating || app.reviewsCount !== reviewCount
      };

      // Production: Log removed
      return result;
    } catch (error) {
      // Production: Error logged
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Method to check and display all apps that need rating updates
  async checkAllAppRatings(): Promise<any[]> {
    try {
      // Production: Log removed
      
      const appsCollection = collection(this.db, 'apps');
      const appsSnapshot = await getDocs(appsCollection);
      
      const appsNeedingUpdate = [];
      
      for (const appDoc of appsSnapshot.docs) {
        const appId = appDoc.id;
        const appData = appDoc.data();
        
        // Get reviews for this app
        const reviewsRef = collection(this.db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('appId', '==', appId));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        // Calculate what the rating should be
        let totalRating = 0;
        let reviewCount = 0;
        
        reviewsSnapshot.docs.forEach(doc => {
          const rating = doc.data()['rating'] || 0;
          if (rating > 0 && rating <= 5) {
            totalRating += rating;
            reviewCount++;
          }
        });
        
        const calculatedRating = reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0;
        const currentRating = appData['rating'] || 0;
        const currentReviewCount = appData['reviewsCount'] || 0;
        
        if (currentRating !== calculatedRating || currentReviewCount !== reviewCount) {
          appsNeedingUpdate.push({
            appId,
            appName: appData['name'],
            currentRating,
            calculatedRating,
            currentReviewCount,
            actualReviewCount: reviewCount,
            needsUpdate: true
          });
        }
      }
      
      // Production: Log removed
      return appsNeedingUpdate;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  // Method to force refresh all app data and clear cache
  async forceRefreshApps(): Promise<App[]> {
    try {
      // Production: Log removed
      
      // Clear all cache
      this.clearCache();
      
      // Reload apps from Firestore
      const apps = await this.loadApps();
      
      // Production: Log removed
      return apps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  // Method to sync reviews from main collection to subcollections
  async syncReviewsToSubcollections(): Promise<void> {
    try {
      // Production: Log removed
      
      // Get all reviews from main collection
      const reviewsCollection = collection(this.db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsCollection);
      
      let syncedCount = 0;
      const appReviewsMap = new Map<string, any[]>();
      
      // Group reviews by appId
      reviewsSnapshot.docs.forEach(doc => {
        const reviewData = doc.data();
        const appId = reviewData['appId'];
        if (appId) {
          if (!appReviewsMap.has(appId)) {
            appReviewsMap.set(appId, []);
          }
          appReviewsMap.get(appId)!.push({
            id: doc.id,
            ...reviewData,
            mainReviewId: doc.id
          });
        }
      });
      
      // Sync reviews to each app's subcollection
      for (const [appId, reviews] of appReviewsMap) {
        try {
          const appReviewsCollection = collection(this.db, 'apps', appId, 'reviews');
          
          // Check which reviews already exist in subcollection
          const existingReviewsSnapshot = await getDocs(appReviewsCollection);
          const existingReviewIds = new Set(existingReviewsSnapshot.docs.map(doc => 
            doc.data()['mainReviewId'] || doc.id
          ));
          
          // Add missing reviews
          for (const review of reviews) {
            if (!existingReviewIds.has(review.id)) {
              try {
                await addDoc(appReviewsCollection, review);
                syncedCount++;
              } catch (addError) {
                // Production: Warning logged
              }
            }
          }
          
          // Update app rating after syncing reviews
          await this.updateAppRatingFromReviews(appId);
          
        } catch (appError) {
          // Production: Warning logged
        }
      }
      
      // Production: Log removed
      
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Method to validate that all app ratings are in sync with reviews
  async validateAllAppRatings(): Promise<any[]> {
    try {
      // Production: Log removed
      
      const validationResults = [];
      const appsCollection = collection(this.db, 'apps');
      const appsSnapshot = await getDocs(appsCollection);
      
      for (const appDoc of appsSnapshot.docs) {
        const appId = appDoc.id;
        const appData = appDoc.data();
        const currentRating = appData['rating'] || 0;
        const currentReviewCount = appData['reviewsCount'] || 0;
        
        // Get all reviews for this app from both sources
        let totalRating = 0;
        let actualReviewCount = 0;
        
        // Check subcollection
        try {
          const appReviewsRef = collection(this.db, 'apps', appId, 'reviews');
          const appReviewsSnapshot = await getDocs(appReviewsRef);
          
          appReviewsSnapshot.docs.forEach(doc => {
            const rating = doc.data()['rating'] || 0;
            if (rating > 0 && rating <= 5) {
              totalRating += rating;
              actualReviewCount++;
            }
          });
        } catch (error) {
          // Subcollection might not exist
        }
        
        // Check main collection
        try {
          const reviewsRef = collection(this.db, 'reviews');
          const reviewsQuery = query(reviewsRef, where('appId', '==', appId));
          const reviewsSnapshot = await getDocs(reviewsQuery);
          
          reviewsSnapshot.docs.forEach(doc => {
            const rating = doc.data()['rating'] || 0;
            if (rating > 0 && rating <= 5) {
              totalRating += rating;
              actualReviewCount++;
            }
          });
        } catch (error) {
          // Production: Warning logged
        }
        
        const calculatedRating = actualReviewCount > 0 ? 
          Math.round((totalRating / actualReviewCount) * 10) / 10 : 0;
        
        const isRatingValid = Math.abs(currentRating - calculatedRating) < 0.1;
        const isCountValid = currentReviewCount === actualReviewCount;
        
        if (!isRatingValid || !isCountValid) {
          validationResults.push({
            appId,
            appName: appData['name'],
            currentRating,
            calculatedRating,
            currentReviewCount,
            actualReviewCount,
            ratingValid: isRatingValid,
            countValid: isCountValid,
            needsUpdate: !isRatingValid || !isCountValid
          });
        }
      }
      
      // Production: Log removed
      return validationResults;
      
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'reportCount'>): Promise<string | null> {
    try {
      const user = this.authService.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to add review');
      }

      const reviewData = {
        ...review,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userEmail: user.email,
        createdAt: new Date(),
        helpfulCount: 0,
        reportCount: 0
      };

      let reviewId: string | null = null;

      // Add review to both the main collection and the app's subcollection
      try {
        // Add to main reviews collection
        const reviewsCollection = collection(this.db, 'reviews');
        const mainDocRef = await addDoc(reviewsCollection, reviewData);
        reviewId = mainDocRef.id;
        
        // Also add to the app's subcollection for easier querying
        const appReviewsCollection = collection(this.db, 'apps', review.appId, 'reviews');
        await addDoc(appReviewsCollection, {
          ...reviewData,
          mainReviewId: reviewId // Reference to the main collection document
        });
        
        // Production: Log removed
      } catch (error) {
        // Production: Warning logged
        // Fallback: add only to main collection
        const reviewsCollection = collection(this.db, 'reviews');
        const docRef = await addDoc(reviewsCollection, reviewData);
        reviewId = docRef.id;
      }
      
      // Automatically update the app's rating after adding a review
      if (reviewId && review.appId) {
        try {
          await this.updateAppRatingFromReviews(review.appId);
          // Production: Log removed
        } catch (updateError) {
          // Production: Warning logged
        }
      }
      
      return reviewId;
    } catch (error) {
      // Production: Error logged
      return null;
    }
  }

  // ==================== USER PROFILE ====================
  
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = doc(this.db, 'users', uid);
      const snapshot = await getDoc(userDoc);
      
      if (snapshot.exists()) {
        return {
          uid: snapshot.id,
          ...snapshot.data(),
          createdAt: snapshot.data()['createdAt']?.toDate() || new Date(),
          lastLogin: snapshot.data()['lastLogin']?.toDate() || new Date()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      // Production: Error logged
      return null;
    }
  }

  async addToUserFavorites(uid: string, appId: string): Promise<void> {
    try {
      const userDoc = doc(this.db, 'users', uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const currentFavorites = userSnap.data()['favorites'] || [];
        if (!currentFavorites.includes(appId)) {
          await updateDoc(userDoc, {
            favorites: [...currentFavorites, appId]
          });
        }
      }
    } catch (error) {
      // Production: Error logged
    }
  }

  async removeFromUserFavorites(uid: string, appId: string): Promise<void> {
    try {
      const userDoc = doc(this.db, 'users', uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const currentFavorites = userSnap.data()['favorites'] || [];
        await updateDoc(userDoc, {
          favorites: currentFavorites.filter((id: string) => id !== appId)
        });
      }
    } catch (error) {
      // Production: Error logged
    }
  }

  async addToUserDownloads(uid: string, appId: string): Promise<void> {
    try {
      const userDoc = doc(this.db, 'users', uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const currentDownloads = userSnap.data()['downloads'] || [];
        if (!currentDownloads.includes(appId)) {
          await updateDoc(userDoc, {
            downloads: [...currentDownloads, appId]
          });
        }
      }
    } catch (error) {
      // Production: Error logged
    }
  }

  async getUserFavoriteApps(uid: string): Promise<App[]> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile || !profile.favorites.length) {
        return [];
      }

      const favoriteApps: App[] = [];
      for (const appId of profile.favorites) {
        const app = await this.getAppById(appId);
        if (app) {
          favoriteApps.push(app);
        }
      }
      
      return favoriteApps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  async getUserDownloadedApps(uid: string): Promise<App[]> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile || !profile.downloads.length) {
        return [];
      }

      const downloadedApps: App[] = [];
      for (const appId of profile.downloads) {
        const app = await this.getAppById(appId);
        if (app) {
          downloadedApps.push(app);
        }
      }
      
      return downloadedApps;
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }

  // ==================== UTILITY METHODS ====================
  
  private mapDocToApp(doc: any): App {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      publisher: data.publisher || '',
      category: data.category || '',
      categoryId: data.categoryId || '',
      description: data.description || '',
      version: data.version || '1.0.0',
      rating: data.rating || 0,
      reviewsCount: data.reviewsCount || 0,
      downloads: data.downloads || 0,
      iconUrl: data.iconUrl || '',
      iconThumbUrl: data.iconThumbUrl || data.iconUrl || '',
      screenshotUrls: data.screenshotUrls || [],
      screenshotThumbUrls: data.screenshotThumbUrls || data.screenshotUrls || [],
      apkUrl: data.apkUrl || '',
      apkFileName: data.apkFileName || '',
      packageName: data.packageName || '',
      whatsNew: data.whatsNew || '',
      releaseDate: data.releaseDate?.toDate() || new Date(),
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
      size: data.size || 'Unknown',
      requiresAndroid: data.requiresAndroid || '5.0+',
      permissions: data.permissions || [],
      tags: data.tags || [],
      isFeatured: data.isFeatured || false,
      isNew: data.isNew || false,
      isTopRated: data.isTopRated || false,
      isEditorChoice: data.isEditorChoice || false,
      ageRating: data.ageRating || 'Everyone',
      contentRating: data.contentRating || 'E',
      developerWebsite: data.developerWebsite || '',
      privacyPolicyUrl: data.privacyPolicyUrl || '',
      privacyPolicy: data.privacyPolicy || '',
      supportEmail: data.supportEmail || '',
      inAppPurchases: data.inAppPurchases || false,
      containsAds: data.containsAds || false
    };
  }

  private updateFeaturedApps(apps: App[]) {
    const featured = apps.filter(app => app.isFeatured).slice(0, 5);
    this.featuredAppsSubject.next(featured);
  }

  // File download helper
  async downloadApp(app: App): Promise<void> {
    try {
      if (app.apkUrl) {
        // Increment download count
        if (app.id) {
          await this.incrementDownloads(app.id);
        }
        
        // Trigger download
        const link = document.createElement('a');
        link.href = app.apkUrl;
        
        // Use stored apkFileName if available, otherwise fallback to sanitized name generation
        if (app.apkFileName) {
          link.download = app.apkFileName;
        } else {
          // Fallback for older apps without stored filename
          const sanitizedAppName = app.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
            .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
            .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
          
          const randomNumber = Math.floor(Math.random() * 100) + 1;
          link.download = `${sanitizedAppName}-${randomNumber}.apk`;
        }
        
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Utility method to fix existing documents with missing fields
  async fixExistingAppsData(): Promise<void> {
    try {
      // Production: Log removed
      
      const appsCollection = collection(this.db, 'apps');
      const snapshot = await getDocs(appsCollection);
      
      let fixedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const updates: any = {};
        
        // Add missing downloads field
        if (data['downloads'] === undefined) {
          updates.downloads = 0;
        }
        
        // Add missing rating field
        if (data['rating'] === undefined) {
          updates.rating = 0;
        }
        
        // Add missing reviewsCount field
        if (data['reviewsCount'] === undefined) {
          updates.reviewsCount = 0;
        }
        
        // Add missing boolean fields
        if (data['isFeatured'] === undefined) {
          updates.isFeatured = false;
        }
        
        if (data['isTopRated'] === undefined) {
          updates.isTopRated = false;
        }
        
        if (data['isNew'] === undefined) {
          updates.isNew = false;
        }
        
        if (data['isEditorChoice'] === undefined) {
          updates.isEditorChoice = false;
        }
        
        // Add missing releaseDate and lastUpdated fields
        if (!data['releaseDate']) {
          updates.releaseDate = new Date();
        }
        
        if (!data['lastUpdated']) {
          updates.lastUpdated = new Date();
        }
        
        // Add missing screenshotUrls field
        if (!data['screenshotUrls']) {
          updates.screenshotUrls = [];
        }
        
        // Add missing permissions field
        if (!data['permissions']) {
          updates.permissions = [];
        }
        
        // Add missing tags field
        if (!data['tags']) {
          updates.tags = [];
        }
        
        // Add missing apkUrl field
        if (!data['apkUrl']) {
          updates.apkUrl = '';
        }
        
        // Add missing size field
        if (!data['size']) {
          updates.size = 'Unknown';
        }
        
        // Add missing version field
        if (!data['version']) {
          updates.version = '1.0.0';
        }
        
        // Add missing requiresAndroid field
        if (!data['requiresAndroid']) {
          updates.requiresAndroid = '5.0+';
        }
        
        // Add missing ageRating field
        if (!data['ageRating']) {
          updates.ageRating = 'Everyone';
        }
        
        // Add missing contentRating field
        if (!data['contentRating']) {
          updates.contentRating = 'E';
        }
        
        // Update the document if there are any missing fields
        if (Object.keys(updates).length > 0) {
          const docRef = doc(this.db, 'apps', docSnapshot.id);
          await updateDoc(docRef, updates);
          fixedCount++;
          // Production: Log removed
        }
      }
      
      // Production: Log removed
      
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Public method to manually trigger data fix
  async repairAppsData(): Promise<void> {
    await this.fixExistingAppsData();
    await this.loadApps(); // Reload after fixing
  }

  // Method to sync and fix category-app relationships
  async syncCategoryAppData(): Promise<void> {
    try {
      // Production: Log removed
      
      // Get all categories and apps
      const [categories, apps] = await Promise.all([
        this.loadCategories(),
        this.getAllApps()
      ]);
      
      // Production: Log removed
      
      // Create a map of category names to IDs (case-insensitive)
      const categoryNameMap = new Map<string, string>();
      categories.forEach(cat => {
        if (cat.name && cat.id) {
          categoryNameMap.set(cat.name.toLowerCase().trim(), cat.id);
        }
      });
      
      let updatedAppsCount = 0;
      
      // Check each app and fix missing categoryId
      for (const app of apps) {
        if (app.id && app.category && !app.categoryId) {
          const normalizedCategoryName = app.category.toLowerCase().trim();
          const categoryId = categoryNameMap.get(normalizedCategoryName);
          
          if (categoryId) {
            try {
              await this.updateAppCategoryId(app.id, categoryId);
              updatedAppsCount++;
            } catch (error) {
              // Production: Error logged
            }
          } else {
            // Production: Warning logged
          }
        }
      }
      
      // Production: Log removed
      
      // Reload data after sync
      await Promise.all([
        this.loadCategories(),
        this.loadApps()
      ]);
      
      // Production: Log removed
    } catch (error) {
      // Production: Error logged
      throw error;
    }
  }

  // Helper method to get all apps without filtering
  private async getAllApps(): Promise<App[]> {
    try {
      const appsCollection = collection(this.db, 'apps');
      const snapshot = await getDocs(appsCollection);
      return snapshot.docs.map(doc => this.mapDocToApp(doc));
    } catch (error) {
      // Production: Error logged
      return [];
    }
  }
}
