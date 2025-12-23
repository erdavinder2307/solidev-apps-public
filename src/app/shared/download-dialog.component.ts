import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { App } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { DownloadDialogService, DownloadDialogConfig, DownloadDialogResult } from '../services/download-dialog.service';

@Component({
  selector: 'app-download-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgOptimizedImage],
  template: `
    <div class="download-dialog-overlay" *ngIf="config?.show" (click)="onOverlayClick($event)">
      <div class="download-dialog-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="dialog-header">
          <h4 class="dialog-title">
            <i class="fas fa-download me-2"></i>
            Download {{ config?.app?.name }}
          </h4>
          <button type="button" class="btn-close" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- App Info -->
        <div class="app-info-section" *ngIf="config?.app as app">
          <div class="app-summary">
            <img [ngSrc]="app.iconThumbUrl || app.iconUrl" 
                 [alt]="app.name" 
                 class="app-icon"
                 width="64" 
                 height="64"
                 [placeholder]="app.iconThumbUrl || app.iconUrl">
            <div class="app-details">
              <h5 class="app-name">{{ app.name }}</h5>
              <p class="app-publisher">{{ app.publisher }}</p>
              <div class="app-meta">
                <span class="rating">
                  <i class="fas fa-star"></i>
                  {{ app.rating.toFixed(1) }}
                </span>
                <span class="separator">•</span>
                <span class="size">{{ app.size }}</span>
                <span class="separator">•</span>
                <span class="category">{{ app.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Download Options -->
        <div class="download-options">
          <div class="option-header">
            <h5>Choose how to proceed:</h5>
            <p class="text-muted">You can download apps without logging in, but creating an account gives you additional benefits.</p>
          </div>

          <!-- Login Option -->
          <div class="download-option login-option" (click)="selectOption('login')">
            <div class="option-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="option-content">
              <h6>Login to Download</h6>
              <p>Get personalized recommendations, track downloads, and sync across devices.</p>
              <div class="benefits">
                <span class="benefit"><i class="fas fa-check"></i> Download tracking</span>
                <span class="benefit"><i class="fas fa-check"></i> Favorites & wishlist</span>
                <span class="benefit"><i class="fas fa-check"></i> Reviews & ratings</span>
              </div>
            </div>
            <div class="option-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <!-- Guest Download Option -->
          <div class="download-option guest-option">
            <div class="option-icon">
              <i class="fas fa-download"></i>
            </div>
            <div class="option-content">
              <h6>Continue as Guest</h6>
              <p>Download now without creating an account. You can always sign up later.</p>
              
              <!-- Terms Agreement Form -->
              <form [formGroup]="guestForm" class="guest-form">
                <div class="terms-agreement">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="agreeTerms"
                      formControlName="agreeTerms">
                    <label class="form-check-label" for="agreeTerms">
                      I agree to the 
                      <a href="/legal/terms" target="_blank" class="terms-link">Terms of Service</a> 
                      and 
                      <a href="/legal/privacy" target="_blank" class="terms-link">Privacy Policy</a>
                    </label>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  class="btn btn-primary download-btn"
                  [disabled]="!guestForm.get('agreeTerms')?.value"
                  (click)="selectOption('guest')">
                  <i class="fas fa-download me-2"></i>
                  Download Now
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="dialog-footer">
          <div class="footer-note">
            <i class="fas fa-shield-alt me-2"></i>
            <span>All downloads are secure and scanned for malware</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .download-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
      backdrop-filter: blur(2px);
    }

    .download-dialog-container {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    .dialog-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: between;
      align-items: center;
    }

    .dialog-title {
      margin: 0;
      color: #212529;
      font-weight: 600;
      flex: 1;
    }

    .btn-close {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: #f8f9fa;
      color: #495057;
    }

    .app-info-section {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .app-summary {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .app-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .app-details {
      flex: 1;
    }

    .app-name {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
    }

    .app-publisher {
      margin: 0 0 0.5rem 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .app-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .rating {
      color: #ffc107;
      font-weight: 500;
    }

    .separator {
      color: #dee2e6;
    }

    .download-options {
      padding: 1.5rem;
    }

    .option-header {
      margin-bottom: 1.5rem;
    }

    .option-header h5 {
      margin: 0 0 0.5rem 0;
      color: #212529;
      font-weight: 600;
    }

    .download-option {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .download-option:last-child {
      margin-bottom: 0;
    }

    .login-option:hover {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      transform: translateY(-2px);
    }

    .guest-option {
      cursor: default;
    }

    .guest-option:hover {
      border-color: #28a745;
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
    }

    .option-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .login-option .option-icon {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
    }

    .guest-option .option-icon {
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white;
    }

    .option-content {
      flex: 1;
    }

    .option-content h6 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #212529;
    }

    .option-content p {
      margin: 0 0 1rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .benefits {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .benefit {
      font-size: 0.8rem;
      color: #28a745;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .benefit i {
      font-size: 0.7rem;
    }

    .option-arrow {
      color: #6c757d;
      font-size: 1.2rem;
      margin-top: 0.5rem;
    }

    .guest-form {
      margin-top: 0.5rem;
    }

    .terms-agreement {
      margin-bottom: 1rem;
    }

    .form-check {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .form-check-input {
      margin-top: 0.25rem;
      flex-shrink: 0;
    }

    .form-check-label {
      font-size: 0.85rem;
      color: #495057;
      line-height: 1.4;
    }

    .terms-link {
      color: #007bff;
      text-decoration: none;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    .download-btn {
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .download-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .download-btn:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .dialog-footer {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 16px 16px;
    }

    .footer-note {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      font-size: 0.85rem;
    }

    .footer-note i {
      color: #28a745;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .download-dialog-container {
        width: 95%;
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }

      .dialog-header,
      .download-options,
      .dialog-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .app-info-section {
        padding: 1rem;
      }

      .app-summary {
        gap: 0.75rem;
      }

      .app-icon {
        width: 56px;
        height: 56px;
      }

      .download-option {
        padding: 1rem;
        gap: 0.75rem;
      }

      .option-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
      }

      .benefits {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class DownloadDialogComponent implements OnInit, OnDestroy {
  config: DownloadDialogConfig | null = null;
  guestForm: FormGroup;
  private subscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private downloadDialogService: DownloadDialogService
  ) {
    this.guestForm = this.fb.group({
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.subscription = this.downloadDialogService.dialogConfig$.subscribe(config => {
      this.config = config;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  selectOption(option: 'login' | 'guest') {
    if (option === 'login') {
      this.onClose();
      // Navigate to login with return URL
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: window.location.pathname } 
      });
    } else if (option === 'guest') {
      if (this.guestForm.valid && this.config?.app) {
        this.onGuestDownload();
      }
    }
  }

  onGuestDownload() {
    if (this.config?.app) {
      // Emit result for guest download
      this.emitResult({
        action: 'guest',
        agreedToTerms: true
      });
      
      // Proceed with download
      this.downloadApp(this.config.app);
      this.onClose();
    }
  }

  onClose() {
    this.downloadDialogService.emitResult({ action: 'cancel' });
  }

  onOverlayClick(event: MouseEvent) {
    // Close dialog when clicking on overlay
    this.onClose();
  }

  private emitResult(result: DownloadDialogResult) {
    this.downloadDialogService.emitResult(result);
  }

  private downloadApp(app: App) {
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = app.apkUrl;
      
      // Use stored apkFileName if available, otherwise fallback to sanitized name generation
      if (app.apkFileName) {
        link.download = app.apkFileName;
      } else {
        // Fallback for older apps without stored filename
        const sanitizedAppName = app.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with hyphens
          .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
        
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        link.download = `${sanitizedAppName}-${randomNumber}.apk`;
      }
      
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track download (optional - can be implemented later)
      console.log(`Downloaded: ${app.name} as ${link.download}`);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Show error message (could use toast service)
    }
  }
}
