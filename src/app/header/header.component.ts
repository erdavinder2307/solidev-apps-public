import { Component, OnInit, HostListener, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ComingSoonService } from '../services/coming-soon.service';
import { DialogService } from '../services/dialog.service';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isDropdownOpen = false;
  searchQuery = '';
  isScrolled = false;
  isAdmin = false;
  
  private userSubscription: Subscription | null = null;
  // Admin email is configured via environment variable
  private readonly ADMIN_EMAIL = process.env['ADMIN_EMAIL'] || '';
  
  @Output() categoryFilter = new EventEmitter<string>();
  @Output() searchEvent = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private comingSoonService: ComingSoonService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.isAdmin = user?.email === this.ADMIN_EMAIL;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  getDisplayName(): string {
    if (this.user?.displayName) {
      return this.user.displayName;
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0];
    }
    return 'User';
  }

  getUserAvatarUrl(): string | null {
    if (this.user?.photoURL) {
      return this.user.photoURL;
    }
    return null;
  }

  getInitials(): string {
    const name = this.getDisplayName();
    if (name === 'User') {
      return 'U';
    }
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onAvatarError(event: any): void {
    // Hide the broken image and show the default avatar
    event.target.style.display = 'none';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.searchEvent.emit(this.searchQuery.trim());
      // Navigate to search page with search query
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  filterByCategory(category: string) {
    this.categoryFilter.emit(category);
    // Navigate to home page with category filter
    this.router.navigate(['/'], { queryParams: { category: category } });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');
    if (!dropdown && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  async logout() {
    try {
      const confirmed = await this.dialogService.showConfirmDialog({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        type: 'info'
      });
      
      if (confirmed) {
        this.closeDropdown(); // Close dropdown before logout
        await this.authService.logout();
        // Redirect to home page after logout
        this.router.navigate(['/']);
      }
    } catch (error) {
      // Production: Error logged
      // Show error using dialog instead of alert
      await this.dialogService.showConfirmDialog({
        title: 'Error',
        message: 'Error signing out. Please try again.',
        confirmText: 'OK',
        type: 'danger',
        showCancel: false
      });
    }
  }

  // Coming Soon navigation methods for header links
  showProfile(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showProfile();
    this.closeDropdown();
  }

  showDownloads(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showDownload();
    this.closeDropdown();
  }

  showWishlist(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showWishlist();
    this.closeDropdown();
  }

  showSettings(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showSettings();
    this.closeDropdown();
  }

  showHelp(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showHelp();
    this.closeDropdown();
  }

  showNotifications(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showFeature('Notifications');
    this.closeDropdown();
  }

  navigateToDeveloperDashboard() {
    // Only allow admin users to access developer dashboard
    if (this.user?.email === this.ADMIN_EMAIL) {
      this.router.navigate(['/developer-dashboard']);
    } else if (this.user) {
      // User is logged in but not admin
      alert('Access denied. Developer dashboard is only available for authorized administrators.');
    } else {
      // User not logged in - redirect to login with admin requirement
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/developer-dashboard',
          adminRequired: 'true' 
        } 
      });
    }
  }
}
