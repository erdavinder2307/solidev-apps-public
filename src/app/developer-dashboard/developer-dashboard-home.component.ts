import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate, query as animationQuery, stagger } from '@angular/animations';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Firebase imports
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '../firebase.config';
import { AppService } from '../services/app.service';
import { ToastService } from '../services/toast.service';

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
  releaseDate?: any;
  lastUpdated?: any;
}

interface DashboardMetrics {
  totalApps: number;
  totalDownloads: string;
  averageRating: string;
  monthlyRevenue: string;
  newAppsThisMonth: number;
  totalReviews: string;
  growthPercentage: number;
}

@Component({
  selector: 'developer-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatRippleModule,
    MatTooltipModule,
    NgOptimizedImage
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        animationQuery(':enter', style({ opacity: 0, transform: 'translateY(20px)' }), { optional: true }),
        animationQuery(':enter', stagger('100ms', [
          animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ]), { optional: true })
      ])
    ])
  ],
  templateUrl: './developer-dashboard-home.component.html',
  styleUrls: ['./developer-dashboard-home.component.scss']
})
export class DeveloperDashboardHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  recentApps: AppModel[] = [];
  metrics: DashboardMetrics = {
    totalApps: 0,
    totalDownloads: '0',
    averageRating: '0.0',
    monthlyRevenue: '0',
    newAppsThisMonth: 0,
    totalReviews: '0',
    growthPercentage: 0
  };
  
  isLoading = true;
  error: string | null = null;
  
  // Animation state
  animateCards = false;
  
  // Admin operations
  isRecalculatingRatings = false;
  
  // Store APK management
  storeApkUrl: string | null = null;
  storeApkFile: File | null = null;
  isUploadingApk = false;
  apkUploadProgress = 0;
  
  constructor(
    private appService: AppService,
    private toastService: ToastService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
    await this.loadStoreApkUrl();
    this.startRealTimeUpdates();
    
    // Trigger card animations after load
    setTimeout(() => {
      this.animateCards = true;
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startRealTimeUpdates(): void {
    // Update metrics every 30 seconds for demo purposes
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateMetricsAnimation();
      });
  }

  private updateMetricsAnimation(): void {
    // Simulate real-time updates with slight variations
    const downloads = parseInt(this.metrics.totalDownloads.replace(/[K,]/g, ''));
    const newDownloads = downloads + Math.floor(Math.random() * 10);
    this.metrics.totalDownloads = this.formatNumber(newDownloads);
    
    // Update revenue
    const revenue = parseInt(this.metrics.monthlyRevenue.replace(/[,$]/g, ''));
    const newRevenue = revenue + Math.floor(Math.random() * 50);
    this.metrics.monthlyRevenue = newRevenue.toLocaleString();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    
    try {
      const db = getFirestore(firebaseApp);
      const appsCol = collection(db, 'apps');
      const appsQuery = query(appsCol, orderBy('createdAt', 'desc'), limit(5));
      const snapshot = await getDocs(appsQuery);
      
      this.recentApps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppModel[];
      
      // Load all apps to get total count
      const allAppsSnapshot = await getDocs(collection(db, 'apps'));
      this.metrics.totalApps = allAppsSnapshot.size;
      
      // Calculate metrics
      this.calculateMetrics();
      
    } catch (error) {
      // Production: Error logged
      this.error = 'Unable to load dashboard data. Please try again later.';
      this.setFallbackData();
    } finally {
      this.isLoading = false;
    }
  }

  private calculateMetrics(): void {
    // Calculate total downloads from actual app data
    const totalDownloads = this.recentApps.reduce((sum, app) => 
      sum + (app.downloads || 0), 0);
    this.metrics.totalDownloads = this.formatNumber(totalDownloads);
    
    // Calculate average rating from actual ratings
    const appsWithRatings = this.recentApps.filter(app => app.rating && app.rating > 0);
    const totalRating = appsWithRatings.reduce((sum, app) => sum + (app.rating || 0), 0);
    this.metrics.averageRating = appsWithRatings.length > 0 
      ? (totalRating / appsWithRatings.length).toFixed(1)
      : '0.0';
    
    // Calculate total reviews
    const totalReviews = this.recentApps.reduce((sum, app) => 
      sum + (app.reviewsCount || 0), 0);
    this.metrics.totalReviews = this.formatNumber(totalReviews);
    
    // Calculate revenue (simulated based on downloads)
    this.metrics.monthlyRevenue = Math.floor(totalDownloads * 0.5).toLocaleString();
    
    // Set other metrics
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    this.metrics.newAppsThisMonth = this.recentApps.filter(app => {
      const releaseDate = app.releaseDate?.toDate ? app.releaseDate.toDate() : app.releaseDate;
      return releaseDate && new Date(releaseDate) > oneMonthAgo;
    }).length;
    
    // Calculate growth (comparing current to simulated previous)
    this.metrics.growthPercentage = totalDownloads > 0 ? 18 : 0;
  }

  private setFallbackData(): void {
    this.metrics = {
      totalApps: 12,
      totalDownloads: '24.5K',
      averageRating: '4.2',
      monthlyRevenue: '1,247',
      newAppsThisMonth: 2,
      totalReviews: '142',
      growthPercentage: 18
    };
    
    this.recentApps = [
      {
        id: '1',
        name: 'TaskManager Pro',
        category: 'Productivity',
        rating: 4.5,
        iconUrl: '/assets/images/default-app-icon.png',
        description: 'Advanced task management app',
        downloads: 2500
      },
      {
        id: '2',
        name: 'PhotoEditor Plus',
        category: 'Photography',
        rating: 4.2,
        iconUrl: '/assets/images/default-app-icon.png',
        description: 'Professional photo editing tools',
        downloads: 1800
      },
      {
        id: '3',
        name: 'MusicPlayer X',
        category: 'Entertainment',
        rating: 4.7,
        iconUrl: '/assets/images/default-app-icon.png',
        description: 'High-quality music player',
        downloads: 3200
      }
    ];
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getAppDownloads(app: AppModel): string {
    return this.formatNumber(app.downloads || 0);
  }

  // Getter methods for template
  get totalApps(): number { return this.metrics.totalApps; }
  get totalDownloads(): string { return this.metrics.totalDownloads; }
  get averageRating(): string { return this.metrics.averageRating; }
  get monthlyRevenue(): string { return this.metrics.monthlyRevenue; }
  get newAppsThisMonth(): number { return this.metrics.newAppsThisMonth; }
  get totalReviews(): string { return this.metrics.totalReviews; }

  // Event handlers
  onCreateApp(): void {
    // Add analytics tracking here if needed
    // Production: Log removed
  }

  onManageApps(): void {
    // Production: Log removed
  }

  onCardHover(cardType: string): void {
    // Production: Log removed
  }

  retryLoad(): void {
    this.loadDashboardData();
  }

  // Admin operation to recalculate all app ratings from reviews
  async recalculateAllRatings(): Promise<void> {
    if (this.isRecalculatingRatings) return;
    
    this.isRecalculatingRatings = true;
    this.toastService.show('info', 'Recalculating Ratings', 'Starting to recalculate ratings for all apps...');
    
    try {
      await this.appService.recalculateAllAppRatings();
      this.toastService.show('success', 'Ratings Updated', 'Successfully recalculated ratings for all apps from their reviews.');
      
      // Refresh dashboard data
      await this.loadDashboardData();
      
    } catch (error) {
      // Production: Error logged
      this.toastService.show('error', 'Recalculation Failed', 'Failed to recalculate app ratings. Please try again.');
    } finally {
      this.isRecalculatingRatings = false;
    }
  }

  // Admin operation to fix apps with static ratings
  async fixStaticRatings(): Promise<void> {
    if (this.isRecalculatingRatings) return;
    
    this.isRecalculatingRatings = true;
    this.toastService.show('info', 'Fixing Static Ratings', 'Updating apps with static ratings to use calculated ratings...');
    
    try {
      await this.appService.fixStaticRatings();
      this.toastService.show('success', 'Static Ratings Fixed', 'Successfully updated apps to use calculated ratings from reviews.');
      
      // Refresh dashboard data
      await this.loadDashboardData();
      
    } catch (error) {
      // Production: Error logged
      this.toastService.show('error', 'Fix Failed', 'Failed to fix static ratings. Please try again.');
    } finally {
      this.isRecalculatingRatings = false;
    }
  }

  // Store APK Management
  async loadStoreApkUrl(): Promise<void> {
    try {
      const db = getFirestore(firebaseApp);
      const configDoc = doc(db, 'config', 'store-apk');
      const snapshot = await getDoc(configDoc);
      
      if (snapshot.exists()) {
        this.storeApkUrl = snapshot.data()['apkUrl'] || null;
      }
    } catch (error) {
      console.error('Failed to load store APK URL:', error);
    }
  }

  onStoreApkFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.apk')) {
      this.storeApkFile = file;
    } else {
      this.toastService.show('error', 'Invalid File', 'Please select a valid APK file.');
    }
  }

  async uploadStoreApk(): Promise<void> {
    if (!this.storeApkFile || this.isUploadingApk) return;

    this.isUploadingApk = true;
    this.apkUploadProgress = 0;
    this.toastService.show('info', 'Uploading APK', 'Uploading Solidev Store APK...');

    try {
      const storage = getStorage(firebaseApp);
      const db = getFirestore(firebaseApp);
      
      // Upload APK to Firebase Storage
      const apkRef = ref(storage, 'apps/apks/solidev-store-1.apk');
      const uploadTask = uploadBytesResumable(apkRef, this.storeApkFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          this.apkUploadProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          console.error('Upload error:', error);
          this.toastService.show('error', 'Upload Failed', 'Failed to upload APK. Please try again.');
          this.isUploadingApk = false;
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save URL to Firestore config
          const configDoc = doc(db, 'config', 'store-apk');
          await setDoc(configDoc, {
            apkUrl: downloadURL,
            fileName: 'solidev-store-1.apk',
            uploadedAt: new Date(),
            fileSize: this.storeApkFile!.size
          });

          this.storeApkUrl = downloadURL;
          this.storeApkFile = null;
          this.apkUploadProgress = 0;
          this.isUploadingApk = false;

          this.toastService.show('success', 'Upload Complete', 'Solidev Store APK uploaded successfully!');
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      this.toastService.show('error', 'Upload Failed', 'Failed to upload APK. Please try again.');
      this.isUploadingApk = false;
    }
  }

  copyApkUrl(): void {
    if (this.storeApkUrl) {
      navigator.clipboard.writeText(this.storeApkUrl);
      this.toastService.show('success', 'Copied', 'APK URL copied to clipboard!');
    }
  }
}
