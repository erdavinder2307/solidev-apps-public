import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../toast/toast.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { getFirestore, doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../firebase.config';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { AppService, App } from '../services/app.service';
import { DownloadDialogService } from '../services/download-dialog.service';
import { User } from 'firebase/auth';

export interface AppDetails {
  name: string;
  publisher: string;
  iconUrl: string;
  rating: number;
  reviewsCount: number;
  screenshots: string[];
  description: string;
  whatsNew?: string;
  version: string;
}

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  timestamp: Date;
  helpfulCount: number;
  appVersion?: string;
  deviceInfo?: string;
}

export interface RatingBreakdown {
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormsModule, CarouselModule, HeaderComponent, FooterComponent, NgbCarouselModule, RouterModule],
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.scss']
})
export class AppDetailsComponent implements OnInit {
  app: AppDetails = {
    name: '',
    publisher: '',
    iconUrl: '',
    rating: 0,
    reviewsCount: 0,
    screenshots: [],
    description: '',
    whatsNew: '',
    version: ''
  };

  reviews: UserReview[] = [];
  ratingBreakdown: RatingBreakdown = {
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  };
  
  loading = true;
  reviewsLoading = true;
  showAllReviews = false;
  
  // Review form state
  showReviewForm = false;
  submittingReview = false;
  reviewForm = {
    rating: 0,
    title: '',
    comment: '',
    userName: ''
  };
  hoverRating = 0;
  
  // Authentication state
  user: User | null = null;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 600,
    navText: [
      '<i class="fas fa-chevron-left"></i>', 
      '<i class="fas fa-chevron-right"></i>'
    ],
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false
      },
      480: {
        items: 2,
        nav: false
      },
      768: {
        items: 3,
        nav: true
      },
      1024: {
        items: 4,
        nav: true
      }
    },
    nav: true
  };

  constructor(
    private route: ActivatedRoute, 
    private toastService: ToastService,
    private authService: AuthService,
    private appService: AppService,
    private router: Router,
    private downloadDialogService: DownloadDialogService
  ) {}

  async ngOnInit() {
    // Subscribe to authentication state
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      await Promise.all([
        this.loadAppDetails(appId),
        this.loadReviews(appId)
      ]);
    }
    this.loading = false;
  }

  async loadAppDetails(id: string) {
    const db = getFirestore(firebaseApp);
    const appDoc = doc(db, 'apps', id);
    const snap = await getDoc(appDoc);
    if (snap.exists()) {
      const data = snap.data();
      this.app = {
        name: data['name'] || '',
        publisher: data['publisher'] || '',
        iconUrl: data['iconUrl'] || '',
        rating: data['rating'] || 0,
        reviewsCount: data['reviewsCount'] || data['reviews'] || 0,
        screenshots: data['screenshotUrls'] || [],
        description: data['description'] || '',
        whatsNew: data['whatsNew'] || '',
        version: data['version'] || ''
      };
    }
  }

  async loadReviews(appId: string) {
    const db = getFirestore(firebaseApp);
    const reviewsRef = collection(db, 'apps', appId, 'reviews');
    const q = query(reviewsRef, orderBy('timestamp', 'desc'), limit(this.showAllReviews ? 50 : 3));
    
    try {
      const querySnapshot = await getDocs(q);
      this.reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data['userId'] || '',
          userName: data['userName'] || 'Anonymous',
          userAvatar: data['userAvatar'] || '',
          rating: data['rating'] || 0,
          title: data['title'] || '',
          comment: data['comment'] || '',
          timestamp: data['timestamp']?.toDate() || new Date(),
          helpfulCount: data['helpfulCount'] || 0,
          appVersion: data['appVersion'] || '',
          deviceInfo: data['deviceInfo'] || ''
        } as UserReview;
      });

      // Calculate rating breakdown
      await this.calculateRatingBreakdown(appId);
    } catch (error) {
      // Production: Error logged
    } finally {
      this.reviewsLoading = false;
    }
  }

  async calculateRatingBreakdown(appId: string) {
    const db = getFirestore(firebaseApp);
    const reviewsRef = collection(db, 'apps', appId, 'reviews');
    const allReviewsQuery = query(reviewsRef);
    
    try {
      const querySnapshot = await getDocs(allReviewsQuery);
      const breakdown = { fiveStars: 0, fourStars: 0, threeStars: 0, twoStars: 0, oneStar: 0 };
      
      querySnapshot.docs.forEach(doc => {
        const rating = doc.data()['rating'] || 0;
        switch(Math.floor(rating)) {
          case 5: breakdown.fiveStars++; break;
          case 4: breakdown.fourStars++; break;
          case 3: breakdown.threeStars++; break;
          case 2: breakdown.twoStars++; break;
          case 1: breakdown.oneStar++; break;
        }
      });
      
      this.ratingBreakdown = breakdown;
    } catch (error) {
      // Production: Error logged
    }
  }

  toggleShowAllReviews() {
    this.showAllReviews = !this.showAllReviews;
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      this.loadReviews(appId);
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 29030400) return `${Math.floor(diffInSeconds / 2419200)} months ago`;
    return `${Math.floor(diffInSeconds / 29030400)} years ago`;
  }

  getTotalReviews(): number {
    return this.ratingBreakdown.fiveStars + this.ratingBreakdown.fourStars + 
           this.ratingBreakdown.threeStars + this.ratingBreakdown.twoStars + 
           this.ratingBreakdown.oneStar;
  }

  getRatingPercentage(starCount: number): number {
    const total = this.getTotalReviews();
    return total > 0 ? (starCount / total) * 100 : 0;
  }

  // Review form methods
  toggleReviewForm() {
    // Check if user is logged in
    if (!this.user) {
      this.toastService.show('info', 'Login Required', 'Please login to write a review');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: window.location.pathname } 
      });
      return;
    }

    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) {
      this.resetReviewForm();
    } else {
      // Pre-fill user name if available
      if (this.user.displayName) {
        this.reviewForm.userName = this.user.displayName;
      } else if (this.user.email) {
        this.reviewForm.userName = this.user.email.split('@')[0];
      }
    }
  }

  resetReviewForm() {
    this.reviewForm = {
      rating: 0,
      title: '',
      comment: '',
      userName: ''
    };
    this.hoverRating = 0;
  }

  setRating(rating: number) {
    // Check if user is logged in
    if (!this.user) {
      this.toastService.show('info', 'Login Required', 'Please login to rate this app');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: window.location.pathname } 
      });
      return;
    }

    this.reviewForm.rating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  clearHoverRating() {
    this.hoverRating = 0;
  }

  async submitReview() {
    // Check if user is logged in
    if (!this.user) {
      this.toastService.show('info', 'Login Required', 'Please login to submit a review');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: window.location.pathname } 
      });
      return;
    }

    if (!this.isReviewFormValid()) {
      return;
    }

    this.submittingReview = true;
    const appId = this.route.snapshot.paramMap.get('id');

    if (!appId) {
      // Production: Error logged
      this.submittingReview = false;
      return;
    }

    try {
      const db = getFirestore(firebaseApp);
      const reviewsRef = collection(db, 'apps', appId, 'reviews');

      const reviewData = {
        userId: this.user.uid, // Use authenticated user's ID
        userName: this.reviewForm.userName || this.user.displayName || this.user.email?.split('@')[0] || 'Anonymous',
        userEmail: this.user.email || '',
        userAvatar: this.user.photoURL || '',
        rating: this.reviewForm.rating,
        title: this.reviewForm.title,
        comment: this.reviewForm.comment,
        timestamp: serverTimestamp(),
        helpfulCount: 0,
        appVersion: this.app.version,
        deviceInfo: this.getDeviceInfo(),
        verified: true // Mark as verified since user is authenticated
      };

      await addDoc(reviewsRef, reviewData);
      
      // Refresh reviews and app data
      await Promise.all([
        this.loadReviews(appId),
        this.appService.updateAppRatingFromReviews(appId)
      ]);

      // Reload app data to get updated rating
      await this.loadAppDetails(appId);

      // Reset form and hide it
      this.resetReviewForm();
      this.showReviewForm = false;
      
      // Show success message
      this.toastService.success('Review Submitted!', 'Thank you for your review. It has been posted successfully.');

    } catch (error) {
      // Production: Error logged
      this.toastService.error('Submission Failed', 'There was an error submitting your review. Please try again.');
    } finally {
      this.submittingReview = false;
    }
  }

  async updateAppRating(appId: string) {
    // This method is now handled by the AppService
    // Keeping for backward compatibility but delegating to service
    try {
      await this.appService.updateAppRatingFromReviews(appId);
      // Reload app data to get updated rating
      await this.loadAppDetails(appId);
    } catch (error) {
      // Production: Error logged
    }
  }

  isReviewFormValid(): boolean {
    return this.reviewForm.rating > 0 && 
           this.reviewForm.userName.trim().length > 0 && 
           this.reviewForm.comment.trim().length > 10;
  }

  getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (/iPhone/i.test(userAgent)) {
      return 'iPhone';
    } else if (/iPad/i.test(userAgent)) {
      return 'iPad';
    } else if (/Android/i.test(userAgent)) {
      return 'Android';
    } else if (/Macintosh/i.test(userAgent)) {
      return 'Mac';
    } else if (/Windows/i.test(userAgent)) {
      return 'Windows';
    } else {
      return 'Web Browser';
    }
  }

  async downloadApp() {
    try {
      // Check if user is logged in
      const isLoggedIn = this.authService.isLoggedIn;
      
      if (isLoggedIn) {
        // User is logged in, proceed with direct download
        await this.triggerAppDownload();
      } else {
        // Convert AppDetails to App for the dialog
        const appForDialog: App = this.convertToAppInterface();

        // User is not logged in, show download dialog
        const result = await this.downloadDialogService.showDownloadDialog(appForDialog);
        
        if (result.action === 'login') {
          // User chose to login, navigate to login page
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: window.location.pathname } 
          });
        } else if (result.action === 'guest' && result.agreedToTerms) {
          // User chose guest download and agreed to terms
          await this.triggerAppDownload();
        }
        // If result.action === 'cancel', do nothing
      }
    } catch (error) {
      console.error('Download failed:', error);
      this.toastService.show('error', 'Download Failed', 'Failed to start download. Please try again.');
    }
  }

  private convertToAppInterface(): App {
    const appId = this.route.snapshot.paramMap.get('id') || '';
    return {
      id: appId,
      name: this.app.name,
      publisher: this.app.publisher,
      category: 'Apps', // Default category
      description: this.app.description,
      version: this.app.version,
      rating: this.app.rating,
      reviewsCount: this.app.reviewsCount,
      downloads: 0, // Not available in AppDetails
      iconUrl: this.app.iconUrl,
      iconThumbUrl: this.app.iconUrl, // Use same as iconUrl
      screenshotUrls: this.app.screenshots,
      screenshotThumbUrls: this.app.screenshots, // Use same as screenshotUrls
      apkUrl: '', // Will be resolved when downloading
      whatsNew: this.app.whatsNew,
      releaseDate: new Date(),
      lastUpdated: new Date(),
      size: '25MB', // Default value - could be made dynamic
      requiresAndroid: '5.0+',
      inAppPurchases: false,
      containsAds: false,
      ageRating: '4+',
      featured: false,
      trending: false,
      isPublished: true,
      isTopRated: this.app.rating >= 4.0,
      isNew: false,
      isFeatured: false,
      isEditorChoice: false,
      tags: [],
      permissions: [],
      contentRating: '4+',
      privacyPolicyUrl: '',
      supportEmail: '',
      installing: false
    };
  }

  private async triggerAppDownload() {
    try {
      // Get the actual app data from AppService if needed
      const appId = this.route.snapshot.paramMap.get('id');
      if (appId) {
        const fullApp = await this.appService.getAppById(appId);
        if (fullApp) {
          await this.appService.downloadApp(fullApp);
          this.toastService.show('success', 'Download Started', 'Download started successfully!');
        } else {
          // Fallback: create a temporary app object for download
          const tempApp = this.convertToAppInterface();
          await this.appService.downloadApp(tempApp);
          this.toastService.show('success', 'Download Started', 'Download started successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to trigger download:', error);
      this.toastService.show('error', 'Download Failed', 'Failed to start download. Please try again.');
    }
  }

  getStarDisplayRating(): number {
    return this.hoverRating || this.reviewForm.rating;
  }

  openImageModal(imageUrl: string, index: number) {
    // In a real implementation, you would open a modal or lightbox
    // For now, we'll just open the image in a new tab
    window.open(imageUrl, '_blank');
  }

  shareApp() {
    if (navigator.share) {
      navigator.share({
        title: this.app.name,
        text: `Check out ${this.app.name} by ${this.app.publisher}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toastService.show('success', 'Link Copied', 'App link copied to clipboard!');
      }).catch(() => {
        this.toastService.show('error', 'Share Failed', 'Could not share the app. Please copy the URL manually.');
      });
    }
  }

  addToWishlist() {
    // In a real implementation, you would add to user's wishlist
    this.toastService.show('success', 'Added to Wishlist', `${this.app.name} has been added to your wishlist!`);
  }
}
