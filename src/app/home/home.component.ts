import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppService, App, Category } from '../services/app.service';
import { ImageCacheService } from '../services/image-cache.service';
import { AuthService } from '../services/auth.service';
import { DownloadDialogService } from '../services/download-dialog.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, NgbCarouselModule, HeaderComponent, FooterComponent, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  searchTerm: string = '';
  featuredApps: App[] = [];
  topApps: App[] = [];
  topRatedApps: App[] = [];
  newApps: App[] = [];
  apps: App[] = []; // For backward compatibility
  categories: Category[] = [];
  
  selectedCategory: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  
  loading = true;
  featuredLoading = false;
  
  // Hero section
  heroApps: App[] = [];
  
  // Mobile optimization properties
  isMobile = false;
  touchStartY = 0;
  touchEndY = 0;

  constructor(
    private appService: AppService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private imageCacheService: ImageCacheService,
    private authService: AuthService,
    private downloadDialogService: DownloadDialogService
  ) {}

  async ngOnInit() {
    // Detect mobile device
    this.isMobile = this.isMobileDevice();
    
    await this.loadData();
    
    // Set up auto-refresh for dynamic data every 5 minutes
    setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000);
  }

  ngAfterViewInit() {
    // Component initialization complete
    // Add touch event listeners for mobile optimization
    if (this.isMobile) {
      this.setupMobileOptimizations();
    }
  }

    // Image caching and preloading methods
  private async preloadCriticalImages(): Promise<void> {
    try {
      const allApps = [...this.featuredApps, ...this.topApps, ...this.topRatedApps];
      
      // Preload critical images (icons and first screenshots) with error handling
      await this.imageCacheService.preloadCriticalImages(allApps).catch(() => {
        // Silently handle preload failures - images will load normally when displayed
      });
      
      // Lazy preload remaining images - this is fire-and-forget
      this.imageCacheService.lazyPreloadImages(allApps);
    } catch (error) {
      // Silent error handling for production - preloading is optional
    }
  }

  async loadData() {
    try {
      this.loading = true;
      
      // Load all data concurrently
      const [categories, featured, top, topRated, newApps] = await Promise.all([
        this.appService.loadCategories(),
        this.appService.getFeaturedApps(6),
        this.appService.getTopApps(12),
        this.appService.getTopRatedApps(8),
        this.appService.getNewApps(8)
      ]);
      
      this.categories = categories;
      this.featuredApps = featured;
      this.topApps = top;
      this.topRatedApps = topRated;
      this.newApps = newApps;
      
      // Add sample data if no featured apps exist (for testing)
      if (!this.featuredApps || this.featuredApps.length === 0) {
        this.featuredApps = this.getSampleFeaturedApps();
      }
      
      // Set hero apps (first 3 featured apps)
      this.heroApps = this.featuredApps.slice(0, 3);
      
      // Set apps for backward compatibility (combine all apps)
      this.apps = [...this.featuredApps, ...this.topApps, ...this.topRatedApps, ...this.newApps];
      
      // Remove duplicates based on app id
      this.apps = this.apps.filter((app, index, self) => 
        index === self.findIndex(a => a.id === app.id)
      );
      
      // Preload critical images for better performance
      await this.preloadCriticalImages();
      
    } catch (error) {
      // Fallback to sample data if Firebase fails
      this.featuredApps = this.getSampleFeaturedApps();
      this.heroApps = this.featuredApps.slice(0, 3);
      this.apps = [...this.featuredApps];
      
      // Preload sample images too
      await this.preloadCriticalImages();
    } finally {
      this.loading = false;
    }
  }
  
  // Method to refresh data in background
  async refreshData(): Promise<void> {
    try {
      this.loading = true;
      
      // Clear app service cache to force fresh data
      this.appService.clearAppCache();
      
      // Refresh data silently in background
      const [featured, topRated, top, newApps] = await Promise.all([
        this.appService.getFeaturedApps(6),
        this.appService.getTopRatedApps(8),
        this.appService.getTopApps(12),
        this.appService.getNewApps(8)
      ]);
      
      // Update all app data
      this.featuredApps = featured;
      this.topRatedApps = topRated;
      this.topApps = top;
      this.newApps = newApps;
      
      // Update combined apps array
      this.apps = [...this.featuredApps, ...this.topApps, ...this.topRatedApps, ...this.newApps];
      this.apps = this.apps.filter((app, index, self) => 
        index === self.findIndex(a => a.id === app.id)
      );
      
      
    } catch (error) {
      // Silent error handling for production
    } finally {
      this.loading = false;
    }
  }

  onSearchSubmit() {
    // Navigate to search page with search term
    if (this.searchTerm?.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchTerm.trim() } 
      });
      // Clear the search term on home page after navigation
      this.searchTerm = '';
    }
  }

  viewAppDetails(appId: string) {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    this.router.navigate(['/app-details', appId]);
  }

  viewCategory(categoryId: string) {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    this.router.navigate(['/categories', categoryId]);
  }

  viewAllCategories() {
    this.router.navigate(['/categories']);
  }

  async downloadApp(app: App, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Prevent multiple downloads
    if (app.installing) {
      return;
    }
    
    try {
      // Set installing state
      app.installing = true;
      
      // Add haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Check if user is logged in
      const isLoggedIn = this.authService.isLoggedIn;
      
      if (isLoggedIn) {
        // User is logged in, proceed with direct download
        await this.appService.downloadApp(app);
      } else {
        // User is not logged in, show download dialog
        const result = await this.downloadDialogService.showDownloadDialog(app);
        
        if (result.action === 'login') {
          // User chose to login, navigate to login page
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: window.location.pathname } 
          });
        } else if (result.action === 'guest' && result.agreedToTerms) {
          // User chose guest download and agreed to terms
          await this.appService.downloadApp(app);
        }
        // If result.action === 'cancel', do nothing
      }
    } catch (error) {
      // Silent error handling for production
      console.error('Download failed:', error);
    } finally {
      // Clear installing state
      app.installing = false;
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatDownloadCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M+`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return count.toString();
  }

  // Backward compatibility methods
  navigateToApp(app: App): void {
    if (app.id) {
      this.viewAppDetails(app.id);
    }
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/categories', category.id]);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    // Optional: Add debouncing here if needed for performance
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = ''; // Also clear category filter
  }

  filterByCategory(category: Category): void {
    const categoryName = category.name;
    this.selectedCategory = categoryName === this.selectedCategory ? '' : categoryName;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category === this.selectedCategory ? '' : category;
  }

  clearCategory(): void {
    this.selectedCategory = '';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // Additional methods for template compatibility
  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(1);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getTopRatedApps(): App[] {
    return this.topRatedApps;
  }

  getFilteredApps(): App[] {
    let filtered = this.apps;
    
    // Filter by category first
    if (this.selectedCategory) {
      filtered = filtered.filter(app => 
        app.category?.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }
    
    // Then filter by search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(app =>
        app.name?.toLowerCase().includes(term) ||
        app.publisher?.toLowerCase().includes(term) ||
        app.description?.toLowerCase().includes(term) ||
        app.category?.toLowerCase().includes(term) ||
        (app.tags && Array.isArray(app.tags) && app.tags.some(tag => 
          tag?.toLowerCase().includes(term)
        ))
      );
    }
    
    return filtered;
  }

  getSearchResultsCount(): number {
    return this.getFilteredApps().length;
  }

  hasSearchResults(): boolean {
    return this.getSearchResultsCount() > 0;
  }

  isSearching(): boolean {
    return !!(this.searchTerm && this.searchTerm.trim());
  }

  trackByAppId(index: number, app: App): string {
    return app.id || index.toString();
  }

  installApp(app: App, event?: Event): void {
    this.downloadApp(app, event);
  }

  showAppOptions(app: App, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // Show options menu (placeholder)
  }

  // Legacy method for backward compatibility
  async loadAppsFromFirestore() {
    return this.loadData();
  }

  get filteredApps(): App[] {
    let filtered = this.apps;
    
    if (this.selectedCategory) {
      filtered = filtered.filter(app => app.category === this.selectedCategory);
    }
    
    return filtered;
  }

  getDownloadCount(app: App): string {
    return `${this.formatDownloadCount(app.downloads)} downloads`;
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : 'fas fa-mobile-alt';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.color : '#6c757d';
  }
  
  // Rating and review formatting methods
  formatRating(rating: number): string {
    if (!rating || rating === 0) return '0.0';
    return rating.toFixed(1);
  }
  
  formatReviewsCount(count: number): string {
    if (!count || count === 0) return 'No reviews';
    if (count === 1) return '1 review';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M reviews`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K reviews`;
    return `${count} reviews`;
  }
  
  // Short format for display in compact areas
  formatReviewsCountShort(count: number): string {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }
  
  // Check if app has valid rating
  hasValidRating(app: App): boolean {
    return app.rating > 0;
  }
  
  // Get star display for rating (handles decimal ratings better)
  getStarDisplay(rating: number): { fullStars: number, halfStar: boolean, emptyStars: number } {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return { fullStars, halfStar, emptyStars };
  }
  
  // Get app statistics for tooltips or display
  getAppStats(app: App): string {
    const rating = this.formatRating(app.rating);
    const reviews = this.formatReviewsCount(app.reviewsCount || 0);
    const downloads = this.formatDownloadCount(app.downloads || 0);
    
    return `Rating: ${rating}/5.0 • ${reviews} • ${downloads} downloads`;
  }
  
  // Method to track when ratings are updated
  onAppUpdated(app: App): void {
    // App updated - silent handling for production
  }

  // Helper method to check if app has screenshots
  hasScreenshots(app: App): boolean {
    return app.screenshotUrls && app.screenshotUrls.length > 0;
  }

  // Helper method to check if app has featured images
  hasFeaturedImages(app: App): boolean {
    return !!(app.featuredImageUrls && app.featuredImageUrls.length > 0);
  }

  // Get valid screenshots for carousel
  getValidScreenshots(app: App): string[] {
    try {
      if (!app || !app.screenshotUrls || app.screenshotUrls.length === 0) {
        return [];
      }
      // Filter out invalid URLs and ensure we have valid strings
      const validScreenshots = app.screenshotUrls.filter(url => 
        url && 
        typeof url === 'string' && 
        url.trim() !== '' && 
        (url.startsWith('http://') || url.startsWith('https://'))
      );
      return validScreenshots;
    } catch (error) {
      return [];
    }
  }

  // Get valid featured images for carousel
  getValidFeaturedImages(app: App): string[] {
    try {
      if (!app || !app.featuredImageUrls || app.featuredImageUrls.length === 0) {
        return [];
      }
      // Filter out invalid URLs and ensure we have valid strings
      const validFeaturedImages = app.featuredImageUrls.filter(url => 
        url && 
        typeof url === 'string' && 
        url.trim() !== '' && 
        (url.startsWith('http://') || url.startsWith('https://'))
      );
      return validFeaturedImages;
    } catch (error) {
      return [];
    }
  }

  // TrackBy function for screenshots
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // Handle image loading errors
  onImageError(event: any): void {
    // Set placeholder or hide image on error
    const img = event.target;
    img.style.display = 'none';
  }

  // Image load success handling
  onImageLoad(event: any): void {
    // Fade in the image when it loads successfully
    const img = event.target;
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  }

  // Sample data for testing (fallback when Firebase data is not available)
  private getSampleFeaturedApps(): App[] {
    return [
      {
        id: 'sample-app-1',
        name: 'FitTrack Pro',
        publisher: 'HealthTech Solutions',
        category: 'Health & Fitness',
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
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=800&fit=crop&crop=center'
        ],
        apkUrl: 'https://example.com/fittrack-pro.apk',
        whatsNew: 'New workout templates, improved UI, bug fixes',
        releaseDate: new Date('2024-01-15'),
        lastUpdated: new Date('2024-08-15'),
        size: '25.4 MB',
        requiresAndroid: '6.0 and up',
        inAppPurchases: true,
        containsAds: false,
        ageRating: 'Everyone',
        isFeatured: true,
        isTopRated: true,
        isNew: false,
        tags: ['fitness', 'health', 'workout', 'nutrition']
      },
      {
        id: 'sample-app-2',
        name: 'PhotoEditor Studio',
        publisher: 'Creative Apps Inc',
        category: 'Photography',
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
        containsAds: true,
        ageRating: 'Everyone',
        isFeatured: true,
        isNew: false,
        isTopRated: false,
        tags: ['photo', 'editing', 'filters', 'ai']
      }
    ];
  }

  // Enhanced image URL with optimization
  getOptimizedImageUrl(originalUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): string {
    return this.imageCacheService.optimizeImageUrl(originalUrl, options);
  }
  
  // Mobile device detection
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet', 'phone'];
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
           window.innerWidth <= 768;
  }
  
  // Setup mobile-specific optimizations
  private setupMobileOptimizations(): void {
    // Reduce animation duration on mobile for better performance
    if (this.isMobile) {
      document.documentElement.style.setProperty('--transition-smooth', 'all 0.2s ease');
    }
    
    // Setup pull-to-refresh gesture
    this.setupPullToRefresh();
    
    // Optimize scroll performance
    this.optimizeScrollPerformance();
  }
  
  // Pull-to-refresh functionality
  private setupPullToRefresh(): void {
    let isRefreshing = false;
    
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      this.touchEndY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', () => {
      const pullDistance = this.touchEndY - this.touchStartY;
      const pullThreshold = 100;
      
      // If user pulled down from top of page
      if (pullDistance > pullThreshold && window.scrollY === 0 && !isRefreshing) {
        isRefreshing = true;
        this.refreshData().finally(() => {
          isRefreshing = false;
        });
        
        // Provide haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, { passive: true });
  }
  
  // Optimize scroll performance on mobile
  private optimizeScrollPerformance(): void {
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          // Add scroll-based optimizations here if needed
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });
  }
}
