import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AppService, App, Category } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { DownloadDialogService } from '../services/download-dialog.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, NgOptimizedImage],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: App[] = [];
  categories: Category[] = [];
  selectedCategoryId: string = '';
  loading = false;
  hasSearched = false;
  sortBy: string = 'relevance';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Suggestions and trending
  trendingSearches: string[] = [
    'Games', 'Social Media', 'Productivity', 'Photo Editor', 
    'Music', 'Video Player', 'Health', 'Shopping'
  ];
  
  recentSearches: string[] = [];
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private downloadDialogService: DownloadDialogService
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (term.trim()) {
        this.performSearch(term.trim());
      } else {
        this.clearSearch();
      }
    });
  }

  async ngOnInit() {
    await this.loadCategories();
    this.loadRecentSearches();
    
    // Check for search term in URL
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
        this.performSearch(this.searchTerm);
      }
      if (params['category']) {
        this.selectedCategoryId = params['category'];
      }
      if (params['sort']) {
        this.sortBy = params['sort'];
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadCategories() {
    try {
      this.categories = await this.appService.loadCategories();
    } catch (error) {
      // Production: Error logged
    }
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
    this.updateUrl();
  }

  async performSearch(term: string) {
    try {
      this.loading = true;
      this.hasSearched = true;
      
      // Save to recent searches
      this.addToRecentSearches(term);
      
      // Perform search
      let results = await this.appService.searchApps(term);
      
      // Filter by category if selected
      if (this.selectedCategoryId) {
        results = results.filter(app => app.categoryId === this.selectedCategoryId);
      }
      
      // Sort results
      results = this.sortResults(results);
      
      this.searchResults = results;
    } catch (error) {
      // Production: Error logged
      this.searchResults = [];
    } finally {
      this.loading = false;
    }
  }

  clearSearch() {
    this.searchResults = [];
    this.hasSearched = false;
    this.searchTerm = '';
    this.updateUrl();
  }

  onCategoryChange() {
    if (this.searchTerm.trim()) {
      this.performSearch(this.searchTerm.trim());
    }
    this.updateUrl();
  }

  onSortChange() {
    if (this.searchResults.length > 0) {
      this.searchResults = this.sortResults([...this.searchResults]);
    }
    this.updateUrl();
  }

  private sortResults(apps: App[]): App[] {
    switch (this.sortBy) {
      case 'rating':
        return apps.sort((a, b) => b.rating - a.rating);
      case 'downloads':
        return apps.sort((a, b) => b.downloads - a.downloads);
      case 'newest':
        return apps.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
      case 'name':
        return apps.sort((a, b) => a.name.localeCompare(b.name));
      default: // relevance
        return apps;
    }
  }

  private updateUrl() {
    const queryParams: any = {};
    
    if (this.searchTerm.trim()) {
      queryParams.q = this.searchTerm.trim();
    }
    
    if (this.selectedCategoryId) {
      queryParams.category = this.selectedCategoryId;
    }
    
    if (this.sortBy !== 'relevance') {
      queryParams.sort = this.sortBy;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  searchTrendingTerm(term: string) {
    this.searchTerm = term;
    this.performSearch(term);
  }

  searchRecentTerm(term: string) {
    this.searchTerm = term;
    this.performSearch(term);
  }

  private addToRecentSearches(term: string) {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(search => search !== term);
    
    // Add to beginning
    this.recentSearches.unshift(term);
    
    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  private loadRecentSearches() {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch (error) {
      // Production: Error logged
    }
  }

  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  viewAppDetails(appId: string) {
    this.router.navigate(['/app-details', appId]);
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

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }
}
