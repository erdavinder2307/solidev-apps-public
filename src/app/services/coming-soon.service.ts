import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ComingSoonService {

  constructor(private router: Router) {}

  /**
   * Navigate to coming soon page with specific feature type
   */
  navigateToComingSoon(featureType: string, featureName?: string) {
    const queryParams: any = { type: featureType };
    if (featureName) {
      queryParams.feature = featureName;
    }
    
    this.router.navigate(['/coming-soon'], { queryParams });
  }

  /**
   * Predefined navigation methods for common features
   */
  showAnalytics() {
    this.navigateToComingSoon('analytics', 'Analytics Dashboard');
  }

  showSettings() {
    this.navigateToComingSoon('settings', 'Settings Panel');
  }

  showDocumentation() {
    this.navigateToComingSoon('documentation', 'Documentation Center');
  }

  showAPI() {
    this.navigateToComingSoon('api', 'API Documentation');
  }

  showSupport() {
    this.navigateToComingSoon('support', 'Support Center');
  }

  showHelp() {
    this.navigateToComingSoon('help', 'Help Center');
  }

  showContact() {
    this.navigateToComingSoon('contact', 'Contact Page');
  }

  showFeedback() {
    this.navigateToComingSoon('feedback', 'Feedback System');
  }

  showBugReport() {
    this.navigateToComingSoon('bug-report', 'Bug Reporting');
  }

  showNewsletter() {
    this.navigateToComingSoon('newsletter', 'Newsletter Management');
  }

  showSocial() {
    this.navigateToComingSoon('social', 'Social Features');
  }

  showDownload() {
    this.navigateToComingSoon('download', 'App Downloads');
  }

  showProfile() {
    this.navigateToComingSoon('profile', 'User Profile');
  }

  showWishlist() {
    this.navigateToComingSoon('wishlist', 'Wishlist Feature');
  }

  showReviews() {
    this.navigateToComingSoon('reviews', 'Review System');
  }

  showRecommendations() {
    this.navigateToComingSoon('recommendations', 'Smart Recommendations');
  }

  /**
   * Generic method for any feature
   */
  showFeature(featureName: string) {
    this.navigateToComingSoon('feature', featureName);
  }
}
