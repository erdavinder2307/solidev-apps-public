import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AppService, App, Category } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { DownloadDialogService } from '../services/download-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent, NgOptimizedImage],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  categoryApps: App[] = [];
  loading = true;
  appsLoading = false;
  selectedCategoryId: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Performance tracking
  private loadStartTime = 0;
  private cacheHitCount = 0;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private downloadDialogService: DownloadDialogService
  ) {}

  async ngOnInit() {
    // Set up reactive subscriptions for real-time updates
    this.setupSubscriptions();
    
    // Load initial data with optimized caching
    await this.loadCategoriesOptimized();
    
    // Check if a specific category is requested via route parameter
    this.route.params.subscribe(params => {
      if (params['categoryId']) {
        this.selectCategory(params['categoryId']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to categories updates
    const categoriesSubscription = this.appService.categories$.subscribe(categories => {
      if (categories.length > 0) {
        this.categories = categories;
      }
    });

    // Subscribe to app counts updates
    const appCountsSubscription = this.appService.categoryAppCounts$.subscribe(appCounts => {
      if (appCounts.size > 0) {
        this.updateCategoriesWithCounts(appCounts);
      }
    });

    this.subscriptions.push(categoriesSubscription, appCountsSubscription);
  }

  private updateCategoriesWithCounts(appCounts: Map<string, number>) {
    this.categories.forEach(category => {
      if (category.id) {
        category.appCount = appCounts.get(category.id) || 0;
      }
    });
  }

  async loadCategoriesOptimized() {
    try {
      this.loadStartTime = performance.now();
      this.loading = true;
      
      // Try to show cached data immediately to improve perceived performance
      const cachedCategories = this.appService.currentCategories;
      const cachedAppCounts = this.appService.currentCategoryAppCounts;
      
      if (cachedCategories.length > 0) {
        this.categories = cachedCategories;
        this.cacheHitCount++;
        if (cachedAppCounts.size > 0) {
          this.updateCategoriesWithCounts(cachedAppCounts);
          this.cacheHitCount++;
        }
        this.loading = false; // Show data immediately
        // Production: Log removed
      }
      
      // Load fresh data in the background
      const [categories, appCounts] = await Promise.all([
        this.appService.loadCategories(),
        this.appService.getCategoryAppCounts()
      ]);
      
      // If no categories found, populate initial categories
      if (categories.length === 0) {
        await this.appService.populateInitialCategories();
        // Reload after population
        const [newCategories, newAppCounts] = await Promise.all([
          this.appService.loadCategories(),
          this.appService.getCategoryAppCounts()
        ]);
        this.categories = newCategories;
        this.updateCategoriesWithCounts(newAppCounts);
      } else {
        // Only update if data is different (to avoid unnecessary re-renders)
        if (JSON.stringify(this.categories) !== JSON.stringify(categories)) {
          this.categories = categories;
        }
        this.updateCategoriesWithCounts(appCounts);
      }
      
      const loadTime = performance.now() - this.loadStartTime;
      // Production: Log removed
      
    } catch (error) {
      // Production: Error logged
    } finally {
      this.loading = false;
    }
  }

  // Legacy method - keeping for backward compatibility but using optimized version
  async loadCategories() {
    await this.loadCategoriesOptimized();
  }

  private async updateCategoryAppCounts(): Promise<void> {
    try {
      // Use the optimized cached method
      const appCounts = await this.appService.getCategoryAppCounts();
      this.updateCategoriesWithCounts(appCounts);

      // Handle any categories with zero counts
      const zeroCategoryIds = this.categories
        .filter(cat => cat.id && (cat.appCount === 0))
        .map(cat => cat.id!);

      if (zeroCategoryIds.length > 0) {
        await this.handleZeroCountCategories(zeroCategoryIds);
      }

    } catch (error) {
      // Production: Error logged
      
      // Fallback to the old method if the new one fails
      await this.updateCategoryAppCountsFallback();
    }
  }

  private async handleZeroCountCategories(zeroCategoryIds: string[]): Promise<void> {
    try {
      for (const categoryId of zeroCategoryIds) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category && category.name) {
          // Try to get apps by both categoryId and category name
          const apps = await this.appService.getAppsByCategory(categoryId);
          
          if (apps.length > 0) {
            category.appCount = apps.length;
          }
        }
      }
      
      // Trigger a sync to fix any missing categoryId fields in apps
      await this.appService.syncCategoryAppData();
      
      // Refresh counts after sync
      const updatedAppCounts = await this.appService.getCategoryAppCounts();
      
      this.categories.forEach(category => {
        if (category.id) {
          const appCount = updatedAppCounts.get(category.id) || 0;
          category.appCount = appCount;
        }
      });
      
    } catch (error) {
      // Production: Error logged
    }
  }

  private async updateCategoryAppCountsFallback(): Promise<void> {
    try {
      // Create promises for all category app counts
      const appCountPromises = this.categories.map(async (category) => {
        if (category.id) {
          try {
            const apps = await this.appService.getAppsByCategory(category.id);
            const appCount = apps.length;
            return { categoryId: category.id, appCount };
          } catch (error) {
            // Production: Error logged
            return { categoryId: category.id, appCount: 0 };
          }
        }
        return { categoryId: '', appCount: 0 };
      });

      // Wait for all promises to resolve
      const appCounts = await Promise.all(appCountPromises);
      
      // Update the categories with app counts
      appCounts.forEach(({ categoryId, appCount }) => {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
          category.appCount = appCount;
        }
      });

    } catch (error) {
      // Production: Error logged
    }
  }

  async populateCategories() {
    try {
      this.loading = true;
      await this.appService.populateInitialCategories();
      await this.loadCategories();
    } catch (error) {
      // Production: Error logged
    }
  }

  async refreshAppCounts() {
    try {
      // Use the optimized refresh method that clears cache
      const appCounts = await this.appService.refreshCategoryAppCounts();
      this.updateCategoriesWithCounts(appCounts);
    } catch (error) {
      // Production: Error logged
    }
  }

  async syncCategoryData() {
    try {
      await this.appService.syncCategoryAppData();
      // Clear app cache to force fresh data after sync
      this.appService.clearAppCache();
      // Refresh the counts after sync
      await this.refreshAppCounts();
    } catch (error) {
      // Production: Error logged
    }
  }

  // Debug method to help troubleshoot app count issues
  async debugCategoriesData() {
    try {
      // Production: Log removed
      // Production: Log removed
      
      for (const category of this.categories) {
        // Production: Log removed
        // Production: Log removed
        
        if (category.id) {
          const apps = await this.appService.getAppsByCategory(category.id);
          // Production: Log removed
          if (apps.length > 0) {
            // Production: Log removed
          }
        }
      }
      
      // Also check the overall app count data
      const appCounts = await this.appService.getCategoryAppCounts();
      // Production: Log removed
    } catch (error) {
      // Production: Error logged
    }
  }

  async selectCategory(categoryId: string) {
    try {
      this.appsLoading = true;
      this.selectedCategoryId = categoryId;
      
      // Use parallel loading for better performance
      const [categoryDetails, categoryApps] = await Promise.all([
        this.appService.getCategoryById(categoryId),
        this.appService.getAppsByCategory(categoryId) // This now uses caching
      ]);
      
      this.selectedCategory = categoryDetails;
      this.categoryApps = categoryApps;
      
      // Update URL without full navigation
      this.router.navigate(['/categories', categoryId], { replaceUrl: true });
    } catch (error) {
      // Production: Error logged
    } finally {
      this.appsLoading = false;
    }
  }

  clearSelection() {
    this.selectedCategory = null;
    this.categoryApps = [];
    this.selectedCategoryId = null;
    this.router.navigate(['/categories'], { replaceUrl: true });
  }

  viewAppDetails(appId: string) {
    this.router.navigate(['/app-details', appId]);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  async downloadApp(app: App, event: Event) {
    event.stopPropagation();
    
    try {
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
      // Production: Error logged
      console.error('Download failed:', error);
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
}
