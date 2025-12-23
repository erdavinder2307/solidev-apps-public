import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComingSoonService } from '../services/coming-soon.service';
import { NewsletterService } from '../services/newsletter.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../firebase.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  isSubscribing = false;
  isAdmin = false;
  user: User | null = null;
  storeApkUrl: string | null = null;
  
  private userSubscription: Subscription | null = null;
  // Admin email is configured via environment variable
  private readonly ADMIN_EMAIL = process.env['ADMIN_EMAIL'] || '';
  private db = getFirestore(firebaseApp);

  constructor(
    private router: Router,
    private comingSoonService: ComingSoonService,
    private newsletterService: NewsletterService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to authentication state changes
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.isAdmin = user?.email === this.ADMIN_EMAIL;
    });
    
    // Load Store APK URL
    this.loadStoreApkUrl();
  }

  async loadStoreApkUrl() {
    try {
      const docRef = doc(this.db, 'config', 'store-apk');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.storeApkUrl = docSnap.data()['apkUrl'] || null;
      }
    } catch (error) {
      console.error('Error loading Store APK URL:', error);
    }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async subscribeNewsletter() {
    if (!this.newsletterEmail.trim()) {
      this.toastService.warning('Invalid Email', 'Please enter an email address');
      return;
    }

    if (!this.newsletterService.isValidEmail(this.newsletterEmail)) {
      this.toastService.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    this.isSubscribing = true;

    try {
      const result = await this.newsletterService.subscribe(this.newsletterEmail, 'footer');
      
      if (result.success) {
        this.toastService.success('Subscription Successful!', result.message);
        this.newsletterEmail = '';
      } else {
        this.toastService.error('Subscription Failed', result.message);
      }
    } catch (error) {
      // Production: Error logged
      this.toastService.error('Subscription Failed', 'An unexpected error occurred. Please try again later.');
    } finally {
      this.isSubscribing = false;
    }
  }

  // Coming Soon navigation methods
  showTopApps(event?: Event) {
    if (event) event.preventDefault();
    this.comingSoonService.showFeature('Top Apps');
  }

  showNewReleases(event?: Event) {
    if (event) event.preventDefault();
    this.comingSoonService.showFeature('New Releases');
  }

  showCategories(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigate(['/categories']);
  }

  showTopGames(event?: Event) {
    if (event) event.preventDefault();
    this.comingSoonService.showFeature('Top Games');
  }

  showEditorsChoice(event?: Event) {
    if (event) event.preventDefault();
    this.comingSoonService.showFeature('Editor\'s Choice');
  }

  showHelpCenter(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showHelp();
  }

  showContact(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/legal/contact']);
  }

  showReportApp(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showBugReport();
  }

  showFeedback(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showFeedback();
  }

  showPublishingGuide(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showDocumentation();
  }

  showAPIDocumentation(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showAPI();
  }

  showAppReview(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showFeature('App Review Process');
  }

  showAnalytics(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showAnalytics();
  }

  showSocial(platform: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showSocial();
  }

  showAppDownload(platform: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showDownload();
  }

  showPrivacyPolicy(platform: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/legal/privacy']);
  }

  showTermsOfService(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/legal/terms']);
  }

  showCookiePolicy(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.comingSoonService.showFeature('Cookie Policy');
  }
}
