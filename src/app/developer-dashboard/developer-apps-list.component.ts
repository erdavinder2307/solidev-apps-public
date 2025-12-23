import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

// Firebase imports
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firebaseApp } from '../../app/firebase.config';
import { AppService } from '../../app/services/app.service';
import { ToastService } from '../../app/services/toast.service';

interface AppModel {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
  iconUrl: string;
  description: string;
  downloads?: number;
  revenue?: number;
}

@Component({
  selector: 'developer-apps-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './developer-apps-list.component.html',
  styleUrls: ['./developer-apps-list.component.scss']
})
export class DeveloperAppsListComponent implements OnInit {
  apps: AppModel[] = [];
  displayedColumns: string[] = ['icon', 'name', 'category', 'rating', 'actions'];
  
  // Calculated metrics
  totalApps = 0;
  totalDownloads = 0;
  averageRating = 0;
  totalRevenue = 0;
  
  // Loading states
  isRecalculatingRatings = false;

  constructor(
    private router: Router,
    private appService: AppService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    await this.loadApps();
  }

  async loadApps() {
    const db = getFirestore(firebaseApp);
    const appsCol = collection(db, 'apps');
    const snapshot = await getDocs(appsCol);
    this.apps = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as AppModel[];
    
    // Calculate metrics
    this.calculateMetrics();
  }
  
  calculateMetrics() {
    this.totalApps = this.apps.length;
    
    // Calculate total downloads from actual app data
    this.totalDownloads = this.apps.reduce((sum, app) => 
      sum + (app.downloads || 0), 0);
    
    // Calculate average rating from actual app ratings
    const appsWithRatings = this.apps.filter(app => app.rating && app.rating > 0);
    this.averageRating = appsWithRatings.length > 0 
      ? appsWithRatings.reduce((sum, app) => sum + (app.rating || 0), 0) / appsWithRatings.length
      : 0;
    
    // Calculate revenue (simulated based on downloads)
    this.totalRevenue = this.totalDownloads * 0.5;
  }

  editApp(app: AppModel) {
    this.router.navigate(['/developer-dashboard/add-app'], { queryParams: { id: app.id } });
  }

  async deleteApp(app: AppModel) {
    if (!confirm(`Are you sure you want to delete "${app.name}"?`)) return;
    const db = getFirestore(firebaseApp);
    await deleteDoc(doc(db, 'apps', app.id));
    await this.loadApps();
  }

  addApp() {
    this.router.navigate(['/developer-dashboard/add-app']);
  }

  getFormattedDownloads(): string {
    return this.totalDownloads >= 1000000
      ? `${(this.totalDownloads/1000000).toFixed(1)}M`
      : this.totalDownloads >= 1000 
        ? `${(this.totalDownloads/1000).toFixed(1)}K` 
        : this.totalDownloads.toString();
  }
  
  getAppDownloads(app: AppModel): string {
    const downloads = app.downloads || 0;
    return downloads >= 1000000
      ? `${(downloads/1000000).toFixed(1)}M`
      : downloads >= 1000
        ? `${(downloads/1000).toFixed(1)}K`
        : downloads.toString();
  }
  
  getFormattedRevenue(): string {
    return `$${(this.totalRevenue/1000).toFixed(1)}K`;
  }
  
  getFormattedRating(): string {
    return this.averageRating > 0 ? this.averageRating.toFixed(1) : '0.0';
  }
  
  getReviewsCount(app: AppModel): string {
    const count = app.reviewsCount || 0;
    if (count === 0) return 'No reviews';
    if (count === 1) return '1 review';
    return `${count} reviews`;
  }
  
  // Admin operations
  async recalculateRatingsForAllApps(): Promise<void> {
    if (this.isRecalculatingRatings) return;
    
    this.isRecalculatingRatings = true;
    this.toastService.show('info', 'Recalculating Ratings', 'Updating all app ratings from reviews...');
    
    try {
      await this.appService.recalculateAllAppRatings();
      await this.loadApps(); // Reload to show updated ratings
      this.toastService.show('success', 'Ratings Updated', 'All app ratings have been recalculated from reviews.');
    } catch (error) {
      // Production: Error logged
      this.toastService.show('error', 'Update Failed', 'Failed to recalculate ratings. Please try again.');
    } finally {
      this.isRecalculatingRatings = false;
    }
  }
}
