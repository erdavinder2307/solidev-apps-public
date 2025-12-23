import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="coming-soon-container" [@fadeIn]>
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <div class="coming-soon-card" [@slideUp]>
          <!-- Icon Section -->
          <div class="icon-section mb-4">
            <div class="main-icon">
              <i class="bi bi-tools"></i>
            </div>
            <div class="floating-icons">
              <i class="bi bi-gear-fill icon-1"></i>
              <i class="bi bi-code-slash icon-2"></i>
              <i class="bi bi-lightning-fill icon-3"></i>
            </div>
          </div>

          <!-- Text Content -->
          <div class="text-content text-center">
            <h1 class="main-title mb-3">{{ getTitle() }}</h1>
            <h2 class="subtitle mb-4">Coming Soon!</h2>
            <p class="description mb-4">
              {{ getDescription() }}
            </p>
            <div class="features-preview mb-5">
              <div class="feature-item" *ngFor="let feature of getExpectedFeatures()">
                <i class="bi bi-check-circle-fill"></i>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div class="progress-section mb-5">
            <div class="progress-header mb-3">
              <span class="progress-label">Development Progress</span>
              <span class="progress-percentage">{{ getProgressPercentage() }}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" [style.width.%]="getProgressPercentage()"></div>
            </div>
            <small class="progress-note">{{ getProgressNote() }}</small>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button mat-raised-button color="primary" class="primary-btn" (click)="goHome()">
              <i class="bi bi-house-door me-2"></i>
              Back to Home
            </button>
            <button mat-stroked-button class="secondary-btn" (click)="goBack()">
              <i class="bi bi-arrow-left me-2"></i>
              Go Back
            </button>
          </div>

          <!-- Newsletter Signup -->
          <div class="newsletter-section mt-5">
            <h6 class="newsletter-title">Get Notified When It's Ready!</h6>
            <p class="newsletter-subtitle">Be the first to know when this feature launches</p>
            <form class="newsletter-form" (ngSubmit)="subscribeToUpdates()" #notifyForm="ngForm">
              <div class="input-group">
                <input 
                  type="email" 
                  class="form-control newsletter-input" 
                  placeholder="Enter your email address"
                  [(ngModel)]="notificationEmail"
                  name="notificationEmail"
                  required
                  #emailInput="ngModel">
                <button 
                  class="btn btn-primary newsletter-btn" 
                  type="submit" 
                  [disabled]="!notifyForm.valid || isSubscribing">
                  <i class="bi bi-bell me-1" *ngIf="!isSubscribing"></i>
                  <div class="spinner-border spinner-border-sm me-1" role="status" *ngIf="isSubscribing">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  {{ isSubscribing ? 'Subscribing...' : 'Notify Me' }}
                </button>
              </div>
              <div class="success-message" *ngIf="subscriptionSuccess">
                <i class="bi bi-check-circle-fill me-2"></i>
                Thanks! We'll notify you when this feature is ready.
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Return Timer (Optional) -->
      <div class="return-timer" *ngIf="showTimer">
        <small class="text-muted">
          <i class="bi bi-clock me-1"></i>
          Returning to previous page in {{ countdown }} seconds...
        </small>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .background-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
    }

    .floating-shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 80px;
      height: 80px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 120px;
      height: 120px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 60px;
      height: 60px;
      bottom: 30%;
      left: 20%;
      animation-delay: 4s;
    }

    .shape-4 {
      width: 100px;
      height: 100px;
      top: 10%;
      right: 30%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(90deg); }
      50% { transform: translateY(-10px) rotate(180deg); }
      75% { transform: translateY(-15px) rotate(270deg); }
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 800px;
    }

    .coming-soon-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
    }

    .icon-section {
      position: relative;
      display: inline-block;
    }

    .main-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      position: relative;
    }

    .main-icon i {
      font-size: 3rem;
      color: white;
    }

    .floating-icons {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      pointer-events: none;
    }

    .floating-icons i {
      position: absolute;
      font-size: 1.5rem;
      color: #667eea;
      animation: orbit 8s linear infinite;
    }

    .icon-1 {
      animation-delay: 0s;
    }

    .icon-2 {
      animation-delay: 2.67s;
    }

    .icon-3 {
      animation-delay: 5.34s;
    }

    @keyframes orbit {
      from {
        transform: rotate(0deg) translateX(100px) rotate(0deg);
      }
      to {
        transform: rotate(360deg) translateX(100px) rotate(-360deg);
      }
    }

    .main-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.8rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .description {
      font-size: 1.1rem;
      color: #4a5568;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }

    .features-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
    }

    .feature-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      color: #4a5568;
      font-weight: 500;
    }

    .feature-item i {
      color: #48bb78;
      font-size: 1.1rem;
    }

    .progress-section {
      max-width: 400px;
      margin: 0 auto;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-label {
      font-weight: 600;
      color: #4a5568;
    }

    .progress-percentage {
      font-weight: 700;
      color: #667eea;
      font-size: 1.1rem;
    }

    .progress-bar-container {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.8s ease;
      animation: progressPulse 2s ease-in-out infinite alternate;
    }

    @keyframes progressPulse {
      0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
      100% { box-shadow: 0 0 0 8px rgba(102, 126, 234, 0); }
    }

    .progress-note {
      color: #718096;
      font-style: italic;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .primary-btn, .secondary-btn {
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .primary-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .secondary-btn {
      border: 2px solid #667eea;
      color: #667eea;
    }

    .secondary-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .newsletter-section {
      max-width: 400px;
      margin: 0 auto;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
    }

    .newsletter-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .newsletter-subtitle {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .newsletter-form .input-group {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .newsletter-input {
      border: none;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
    }

    .newsletter-input:focus {
      box-shadow: none;
      border: none;
    }

    .newsletter-btn {
      border: none;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      font-weight: 600;
    }

    .success-message {
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(72, 187, 120, 0.1);
      border-radius: 8px;
      color: #2f855a;
      font-weight: 500;
    }

    .return-timer {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .coming-soon-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      .main-title {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1.5rem;
      }

      .main-icon {
        width: 100px;
        height: 100px;
      }

      .main-icon i {
        font-size: 2.5rem;
      }

      .floating-icons {
        width: 160px;
        height: 160px;
      }

      .features-preview {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .primary-btn, .secondary-btn {
        width: 100%;
        max-width: 250px;
      }
    }

    @media (max-width: 480px) {
      .coming-soon-container {
        padding: 1rem 0.5rem;
      }

      .main-title {
        font-size: 1.75rem;
      }

      .subtitle {
        font-size: 1.25rem;
      }

      .description {
        font-size: 1rem;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ComingSoonComponent implements OnInit {
  notificationEmail = '';
  isSubscribing = false;
  subscriptionSuccess = false;
  showTimer = false;
  countdown = 5;
  
  // Page-specific content
  pageType = '';
  featureName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get page type and feature name from query params
    this.route.queryParams.subscribe(params => {
      this.pageType = params['type'] || 'feature';
      this.featureName = params['feature'] || 'This Feature';
    });

    // Optional: Auto-redirect after 30 seconds
    // this.startAutoRedirect();
  }

  getTitle(): string {
    const titles: { [key: string]: string } = {
      'analytics': 'Analytics Dashboard',
      'settings': 'Settings Panel',
      'documentation': 'Documentation Center',
      'api': 'API Documentation',
      'support': 'Support Center',
      'help': 'Help Center',
      'contact': 'Contact Page',
      'feedback': 'Feedback System',
      'bug-report': 'Bug Reporting',
      'newsletter': 'Newsletter Management',
      'social': 'Social Features',
      'download': 'App Downloads',
      'profile': 'User Profile',
      'wishlist': 'Wishlist Feature',
      'reviews': 'Review System',
      'recommendations': 'Smart Recommendations'
    };
    
    return titles[this.pageType] || this.featureName;
  }

  getDescription(): string {
    const descriptions: { [key: string]: string } = {
      'analytics': 'Get detailed insights into your app performance, user engagement, and download statistics with our comprehensive analytics dashboard.',
      'settings': 'Customize your experience with advanced settings and preferences tailored to your needs.',
      'documentation': 'Access comprehensive guides, tutorials, and documentation to help you make the most of our platform.',
      'api': 'Integrate with our powerful APIs to extend functionality and create amazing experiences.',
      'support': 'Get help from our expert support team with 24/7 assistance and comprehensive resources.',
      'help': 'Find answers to your questions with our extensive help center and knowledge base.',
      'contact': 'Connect with our team through multiple channels for personalized assistance.',
      'feedback': 'Share your thoughts and help us improve the platform with your valuable feedback.',
      'bug-report': 'Report issues and bugs to help us maintain a high-quality experience for everyone.',
      'newsletter': 'Stay informed with personalized newsletters and updates about your favorite apps.',
      'social': 'Connect with other users, share reviews, and discover apps through social features.',
      'download': 'Download and install your favorite apps directly from our secure platform.',
      'profile': 'Manage your personal information, preferences, and account settings.',
      'wishlist': 'Save apps for later and get notified when they go on sale or receive updates.',
      'reviews': 'Read and write detailed reviews to help others discover great apps.',
      'recommendations': 'Discover new apps tailored to your interests with our AI-powered recommendation engine.'
    };
    
    return descriptions[this.pageType] || 
      'We\'re working hard to bring you an amazing new feature that will enhance your experience on our platform.';
  }

  getExpectedFeatures(): string[] {
    const features: { [key: string]: string[] } = {
      'analytics': ['Real-time data tracking', 'Interactive charts & graphs', 'Export capabilities', 'Custom date ranges'],
      'settings': ['Dark/Light mode toggle', 'Notification preferences', 'Privacy controls', 'Account management'],
      'documentation': ['Step-by-step guides', 'Video tutorials', 'Code examples', 'Search functionality'],
      'api': ['RESTful endpoints', 'Authentication system', 'Rate limiting', 'Comprehensive examples'],
      'support': ['Live chat support', 'Ticket system', 'Knowledge base', 'Community forums'],
      'default': ['Intuitive user interface', 'Mobile-responsive design', 'Fast performance', 'Secure & reliable']
    };
    
    return features[this.pageType] || features['default'];
  }

  getProgressPercentage(): number {
    const progress: { [key: string]: number } = {
      'analytics': 75,
      'settings': 60,
      'documentation': 40,
      'api': 85,
      'support': 55,
      'help': 70,
      'contact': 45,
      'feedback': 30,
      'bug-report': 65,
      'newsletter': 80,
      'social': 25,
      'download': 90,
      'profile': 70,
      'wishlist': 50,
      'reviews': 85,
      'recommendations': 35
    };
    
    return progress[this.pageType] || 50;
  }

  getProgressNote(): string {
    const notes: { [key: string]: string } = {
      'analytics': 'Final testing and optimization in progress',
      'settings': 'User interface refinements underway',
      'documentation': 'Content creation and review phase',
      'api': 'Security testing and documentation finalization',
      'support': 'Training support team and setting up systems',
      'default': 'Development progressing smoothly'
    };
    
    return notes[this.pageType] || notes['default'];
  }

  async subscribeToUpdates() {
    if (!this.notificationEmail || this.isSubscribing) return;
    
    this.isSubscribing = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isSubscribing = false;
      this.subscriptionSuccess = true;
      this.notificationEmail = '';
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.subscriptionSuccess = false;
      }, 5000);
    }, 1500);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.goHome();
    }
  }

  private startAutoRedirect() {
    this.showTimer = true;
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.goBack();
      }
    }, 1000);
  }
}
