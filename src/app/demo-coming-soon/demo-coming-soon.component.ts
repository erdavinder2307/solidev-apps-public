import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ComingSoonService } from '../services/coming-soon.service';
import { ComingSoonDirective } from '../directives/coming-soon.directive';

@Component({
  selector: 'app-demo-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    ComingSoonDirective
  ],
  template: `
    <div class="container py-5">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center mb-5">Coming Soon Features Demo</h2>
          
          <div class="row g-4">
            <!-- Service-based examples -->
            <div class="col-md-4">
              <mat-card class="feature-card h-100">
                <mat-card-header>
                  <mat-card-title>Service Methods</mat-card-title>
                  <mat-card-subtitle>Using ComingSoonService directly</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="d-grid gap-2">
                  <button mat-raised-button color="primary" (click)="showAnalytics($event)">
                    Analytics Dashboard
                  </button>
                  <button mat-raised-button color="primary" (click)="showSettings($event)">
                    Settings Panel
                  </button>
                  <button mat-raised-button color="primary" (click)="showAPI($event)">
                    API Documentation
                  </button>
                  <button mat-raised-button color="primary" (click)="showCustomFeature($event)">
                    Custom Feature
                  </button>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Directive-based examples -->
            <div class="col-md-4">
              <mat-card class="feature-card h-100">
                <mat-card-header>
                  <mat-card-title>Directive Usage</mat-card-title>
                  <mat-card-subtitle>Using appComingSoon directive</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="d-grid gap-2">
                  <button mat-raised-button 
                          appComingSoon="support" 
                          featureName="24/7 Live Support">
                    Live Support
                  </button>
                  <button mat-raised-button 
                          appComingSoon="social" 
                          featureName="Social Network">
                    Social Features
                  </button>
                  <a class="btn btn-outline-primary" 
                     appComingSoon="download" 
                     featureName="Mobile App">
                    Download Mobile App
                  </a>
                  <span class="badge bg-secondary p-2" 
                        appComingSoon="feature" 
                        featureName="Premium Membership"
                        style="cursor: pointer;">
                    Premium Badge
                  </span>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Link examples -->
            <div class="col-md-4">
              <mat-card class="feature-card h-100">
                <mat-card-header>
                  <mat-card-title>Link Examples</mat-card-title>
                  <mat-card-subtitle>Various element types</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <ul class="list-unstyled d-grid gap-2">
                    <li>
                      <a href="#" 
                         appComingSoon="help" 
                         featureName="Knowledge Base"
                         class="text-decoration-none">
                        📚 Knowledge Base
                      </a>
                    </li>
                    <li>
                      <a href="#" 
                         appComingSoon="feedback" 
                         featureName="User Feedback System"
                         class="text-decoration-none">
                        💬 Feedback System
                      </a>
                    </li>
                    <li>
                      <a href="#" 
                         appComingSoon="reviews" 
                         featureName="Review Management"
                         class="text-decoration-none">
                        ⭐ Review Management
                      </a>
                    </li>
                    <li>
                      <a href="#" 
                         appComingSoon="recommendations" 
                         featureName="AI Recommendations"
                         class="text-decoration-none">
                        🤖 AI Recommendations
                      </a>
                    </li>
                  </ul>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Navigation examples -->
          <div class="row mt-5">
            <div class="col-12">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Test Direct Navigation</mat-card-title>
                  <mat-card-subtitle>Navigate directly to coming soon with query parameters</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="d-flex flex-wrap gap-2">
                  <a routerLink="/coming-soon" 
                     [queryParams]="{type: 'analytics', feature: 'Advanced Analytics'}"
                     class="btn btn-outline-info">
                    Analytics Page
                  </a>
                  <a routerLink="/coming-soon" 
                     [queryParams]="{type: 'api', feature: 'REST API v2'}"
                     class="btn btn-outline-info">
                    API Documentation
                  </a>
                  <a routerLink="/coming-soon" 
                     [queryParams]="{type: 'feature', feature: 'Machine Learning Features'}"
                     class="btn btn-outline-info">
                    ML Features
                  </a>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <!-- Back to home -->
          <div class="text-center mt-5">
            <a routerLink="/" class="btn btn-lg btn-primary">
              <i class="bi bi-house-door me-2"></i>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .feature-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .badge {
      transition: all 0.3s ease;
    }
    
    .badge:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
  `]
})
export class DemoComingSoonComponent {
  constructor(private comingSoonService: ComingSoonService) {}

  showAnalytics(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showAnalytics();
  }

  showSettings(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showSettings();
  }

  showAPI(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showAPI();
  }

  showCustomFeature(event: MouseEvent) {
    if(event) event.preventDefault();
    this.comingSoonService.showFeature('Custom Demo Feature');
  }
}
