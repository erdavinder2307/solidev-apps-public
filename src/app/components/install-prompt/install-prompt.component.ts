import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { PwaPromptService } from '../../services/pwa-prompt.service';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebase.config';

/**
 * Component that displays a PWA installation prompt.
 * Shows a floating action button on supported devices and a fallback instruction for iOS Safari.
 */
@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="install-prompt-container" *ngIf="showPrompt">
      <!-- Standard install prompt for supported browsers -->
      <div 
        class="install-prompt-banner" 
        *ngIf="canInstall && !isIOSSafari"
      >
        <div class="banner-content">
          <mat-icon class="install-icon">get_app</mat-icon>
          <div class="banner-text">
            <h4>Install SolidevApps</h4>
            <p>Download our Android app for the best experience</p>
          </div>
          <div class="banner-actions">
            <button 
              mat-stroked-button 
              (click)="dismissPrompt()"
              class="dismiss-btn"
            >
              Not now
            </button>
            <button 
              mat-raised-button 
              color="primary"
              (click)="downloadApk()"
              [disabled]="isInstalling"
              class="install-btn"
            >
              <mat-icon *ngIf="!isInstalling">download</mat-icon>
              <mat-icon *ngIf="isInstalling" class="spinner">refresh</mat-icon>
              {{ isInstalling ? 'Downloading...' : 'Download APK' }}
            </button>
          </div>
        </div>
      </div>

      <!-- iOS Safari fallback with instructions -->
      <div 
        class="ios-install-prompt" 
        *ngIf="isIOSSafari && !isInstalled"
      >
        <div class="ios-banner-content">
          <mat-icon class="install-icon">android</mat-icon>
          <div class="ios-banner-text">
            <h4>Install SolidevApps</h4>
            <p>
              Download our Android APK for the best experience
            </p>
          </div>
          <div class="ios-actions">
            <button 
              mat-stroked-button
              (click)="dismissPrompt()"
              class="dismiss-btn-small"
            >
              Not now
            </button>
            <button 
              mat-raised-button
              color="primary"
              (click)="downloadApk()"
              class="download-btn-small"
            >
              Download APK
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Action Button (alternative display) -->
      <button 
        mat-fab 
        color="primary"
        class="install-fab"
        *ngIf="showFab && canInstall && !isIOSSafari"
        (click)="downloadApk()"
        [disabled]="isInstalling"
        matTooltip="Download APK"
      >
        <mat-icon *ngIf="!isInstalling">get_app</mat-icon>
        <mat-icon *ngIf="isInstalling" class="spinner">refresh</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .install-prompt-container {
      position: fixed;
      z-index: 1000;
    }

    .install-prompt-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      border-top: 1px solid #e0e0e0;
      z-index: 1001;
    }

    .banner-content {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .install-icon {
      color: #1976d2;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .banner-text {
      flex: 1;
    }

    .banner-text h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .banner-text p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .banner-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .dismiss-btn {
      min-width: 80px;
    }

    .install-btn {
      min-width: 100px;
    }

    .install-btn mat-icon {
      margin-right: 8px;
    }

    .ios-install-prompt {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border: 1px solid #e0e0e0;
      z-index: 1001;
    }

    .ios-banner-content {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      gap: 16px;
      position: relative;
      flex-wrap: wrap;
    }

    .ios-banner-text {
      flex: 1;
      min-width: 200px;
    }

    .ios-banner-text h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .ios-banner-text p {
      margin: 0;
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .ios-banner-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .ios-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .dismiss-btn-small,
    .download-btn-small {
      min-width: 80px;
    }

    .ios-dismiss-btn {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .install-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1001;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .banner-content {
        padding: 12px 16px;
        gap: 12px;
      }

      .banner-actions {
        flex-direction: column;
        gap: 8px;
      }

      .dismiss-btn,
      .install-btn {
        width: 100%;
        min-width: unset;
      }

      .ios-install-prompt {
        left: 16px;
        right: 16px;
        bottom: 16px;
      }

      .ios-banner-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .ios-actions {
        width: 100%;
      }

      .dismiss-btn-small,
      .download-btn-small {
        flex: 1;
      }

      .install-fab {
        bottom: 20px;
        right: 20px;
      }
    }

    @media (max-width: 480px) {
      .banner-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .banner-actions {
        width: 100%;
        flex-direction: row;
      }
    }
  `],
  animations: [
    // You can add Angular animations here if needed
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  canInstall = false;
  isInstalled = false;
  isInstalling = false;
  showPrompt = false;
  showFab = false;
  isIOSSafari = false;
  storeApkUrl: string | null = null;

  constructor(
    private pwaPromptService: PwaPromptService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isIOSSafari = this.pwaPromptService.isIOSSafari;
    this.loadStoreApkUrl();

    // Combine all relevant observables
    combineLatest([
      this.pwaPromptService.canInstall$,
      this.pwaPromptService.isAppInstalled$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([canInstall, isInstalled]) => {
      this.canInstall = canInstall;
      this.isInstalled = isInstalled;
      this.updatePromptVisibility();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update the visibility of the install prompt based on current state
   */
  private updatePromptVisibility(): void {
    // Show prompt if:
    // 1. App is not installed AND
    // 2. (Can install OR is iOS Safari) AND
    // 3. User hasn't dismissed it
    this.showPrompt = !this.isInstalled && (this.canInstall || this.isIOSSafari);
    
    // Show FAB as alternative to banner (you can customize this logic)
    this.showFab = false; // Disabled by default, enable if you prefer FAB over banner
  }

  /**
   * Handle the app installation process
   */
  async installApp(): Promise<void> {
    if (!this.canInstall || this.isInstalling) {
      return;
    }

    this.isInstalling = true;
    this.cdr.markForCheck();

    try {
      const result = await this.pwaPromptService.install();
      
      if (result) {
        if (result.outcome === 'accepted') {
          this.snackBar.open('App installed successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('Installation cancelled', 'Close', {
            duration: 2000
          });
        }
      } else {
        this.snackBar.open('Installation not available', 'Close', {
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Installation error:', error);
      this.snackBar.open('Installation failed. Please try again.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isInstalling = false;
      this.showPrompt = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Download the Android APK
   */
  async loadStoreApkUrl(): Promise<void> {
    try {
      const db = getFirestore(firebaseApp);
      const configDoc = doc(db, 'config', 'store-apk');
      const snapshot = await getDoc(configDoc);
      
      if (snapshot.exists()) {
        this.storeApkUrl = snapshot.data()['apkUrl'] || null;
      }
      
      // Fallback to default URL if not found
      if (!this.storeApkUrl) {
        this.storeApkUrl = 'https://firebasestorage.googleapis.com/v0/b/solidev-apps.firebasestorage.app/o/apps%2Fapks%2Fsolidev-store-1.apk?alt=media';
      }
    } catch (error) {
      console.error('Failed to load store APK URL:', error);
      // Use fallback URL
      this.storeApkUrl = 'https://firebasestorage.googleapis.com/v0/b/solidev-apps.firebasestorage.app/o/apps%2Fapks%2Fsolidev-store-1.apk?alt=media';
    }
  }

  downloadApk(): void {
    if (this.isInstalling) {
      return;
    }

    this.isInstalling = true;
    this.cdr.markForCheck();

    try {
      if (!this.storeApkUrl) {
        throw new Error('APK URL not available');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = this.storeApkUrl;
      link.download = 'SolidevApps.apk';
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snackBar.open('Download started! Check your downloads folder.', 'Close', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
      
      // Dismiss prompt after successful download
      setTimeout(() => {
        this.dismissPrompt();
      }, 1000);
      
    } catch (error) {
      console.error('Download error:', error);
      this.snackBar.open('Download failed. Please try again.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isInstalling = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Dismiss the install prompt
   */
  dismissPrompt(): void {
    this.showPrompt = false;
    this.cdr.markForCheck();
    
    // Optional: Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  }
}
