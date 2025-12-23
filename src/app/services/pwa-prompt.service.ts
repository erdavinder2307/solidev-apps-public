import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isIOS, isSafari, isIOSSafari, isPWASupported, isRunningStandalone } from '../utils/pwa-utils';

/**
 * Service to handle PWA installation prompts and related functionality.
 * Manages the beforeinstallprompt event and provides methods for installing the app.
 */
@Injectable({
  providedIn: 'root'
})
export class PwaPromptService {
  private deferredPrompt: any = null;
  private readonly installPromptEvent$ = new BehaviorSubject<boolean>(false);
  private readonly isInstalled$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeService();
  }

  /**
   * Observable that emits true when the install prompt is available
   */
  get canInstall$(): Observable<boolean> {
    return this.installPromptEvent$.asObservable();
  }

  /**
   * Observable that emits true when the app is installed
   */
  get isAppInstalled$(): Observable<boolean> {
    return this.isInstalled$.asObservable();
  }

  /**
   * Initialize the service by setting up event listeners
   */
  private initializeService(): void {
    // Check if app is already installed
    this.checkIfInstalled();

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.installPromptEvent$.next(true);
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled$.next(true);
      this.installPromptEvent$.next(false);
      this.deferredPrompt = null;
    });
  }

  /**
   * Check if the app is already installed
   */
  private checkIfInstalled(): void {
    this.isInstalled$.next(isRunningStandalone());
  }

  /**
   * Trigger the PWA installation prompt
   * @returns Promise that resolves with the user's choice
   */
  async install(): Promise<{ outcome: 'accepted' | 'dismissed' } | null> {
    if (!this.deferredPrompt) {
      return null;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond
      const userChoice = await this.deferredPrompt.userChoice;
      const outcome = userChoice?.outcome || 'dismissed';
      
      // Clean up
      this.deferredPrompt = null;
      this.installPromptEvent$.next(false);
      
      return { outcome };
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return null;
    }
  }

  /**
   * Check if the current device/browser supports PWA installation
   */
  get isInstallSupported(): boolean {
    return isPWASupported();
  }

  /**
   * Check if the device is iOS
   */
  get isIOS(): boolean {
    return isIOS();
  }

  /**
   * Check if the browser is Safari
   */
  get isSafari(): boolean {
    return isSafari();
  }

  /**
   * Check if the current context is iOS Safari (for fallback instructions)
   */
  get isIOSSafari(): boolean {
    return isIOSSafari();
  }
}
