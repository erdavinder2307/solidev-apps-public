import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../services/auth.service';
import { AppService, App, UserProfile } from '../services/app.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, NgOptimizedImage],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userProfile: UserProfile | null = null;
  favoriteApps: App[] = [];
  downloadedApps: App[] = [];
  
  activeTab: 'profile' | 'favorites' | 'downloads' | 'settings' = 'profile';
  loading = true;
  favoritesLoading = false;
  downloadsLoading = false;

  // Profile editing
  editingProfile = false;
  profileForm = {
    displayName: '',
    email: ''
  };

  // Statistics
  stats = {
    totalDownloads: 0,
    totalFavorites: 0,
    totalReviews: 0,
    memberSince: new Date()
  };

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check if user is logged in
    this.authService.user$.subscribe(async (user) => {
      this.user = user;
      if (user) {
        await this.loadUserData();
      } else {
        // Redirect to login if not authenticated
        this.router.navigate(['/login']);
      }
    });
  }

  async loadUserData() {
    try {
      this.loading = true;
      
      if (!this.user) return;

      // Load user profile
      this.userProfile = await this.appService.getUserProfile(this.user.uid);
      
      if (this.userProfile) {
        // Setup profile form
        this.profileForm = {
          displayName: this.userProfile.displayName || this.user.displayName || '',
          email: this.userProfile.email || this.user.email || ''
        };

        // Calculate stats
        this.stats = {
          totalDownloads: this.userProfile.downloads.length,
          totalFavorites: this.userProfile.favorites.length,
          totalReviews: this.userProfile.reviews.length,
          memberSince: this.userProfile.createdAt
        };
      }
    } catch (error) {
      // Production: Error logged
    } finally {
      this.loading = false;
    }
  }

  async loadFavorites() {
    if (!this.user || this.favoritesLoading) return;

    try {
      this.favoritesLoading = true;
      this.favoriteApps = await this.appService.getUserFavoriteApps(this.user.uid);
    } catch (error) {
      // Production: Error logged
    } finally {
      this.favoritesLoading = false;
    }
  }

  async loadDownloads() {
    if (!this.user || this.downloadsLoading) return;

    try {
      this.downloadsLoading = true;
      this.downloadedApps = await this.appService.getUserDownloadedApps(this.user.uid);
    } catch (error) {
      // Production: Error logged
    } finally {
      this.downloadsLoading = false;
    }
  }

  setActiveTab(tab: 'profile' | 'favorites' | 'downloads' | 'settings') {
    this.activeTab = tab;
    
    // Load data based on active tab
    if (tab === 'favorites' && this.favoriteApps.length === 0) {
      this.loadFavorites();
    } else if (tab === 'downloads' && this.downloadedApps.length === 0) {
      this.loadDownloads();
    }
  }

  toggleEditProfile() {
    this.editingProfile = !this.editingProfile;
    
    if (!this.editingProfile && this.user) {
      // Reset form if cancelling
      this.profileForm = {
        displayName: this.user.displayName || '',
        email: this.user.email || ''
      };
    }
  }

  async saveProfile() {
    // In a real app, you would update the user profile in Firestore
    // For now, we'll just toggle the editing state
    this.editingProfile = false;
    // Production: Log removed
  }

  async removeFromFavorites(appId: string) {
    if (!this.user) return;

    try {
      await this.appService.removeFromUserFavorites(this.user.uid, appId);
      this.favoriteApps = this.favoriteApps.filter(app => app.id !== appId);
      
      // Update stats
      this.stats.totalFavorites = this.favoriteApps.length;
    } catch (error) {
      // Production: Error logged
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/']);
    } catch (error) {
      // Production: Error logged
    }
  }

  viewAppDetails(appId: string) {
    this.router.navigate(['/app-details', appId]);
  }

  async downloadApp(app: App, event: Event) {
    event.stopPropagation();
    try {
      await this.appService.downloadApp(app);
    } catch (error) {
      // Production: Error logged
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

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getLastLoginDate(): string {
    if (this.user?.metadata?.lastSignInTime) {
      return this.formatDate(new Date(this.user.metadata.lastSignInTime));
    }
    return 'Just now';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
