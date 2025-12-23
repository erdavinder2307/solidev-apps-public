import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private imageCache = new Map<string, HTMLImageElement>();
  private loadingImages = new Map<string, Promise<HTMLImageElement>>();
  private preloadedImages = new Set<string>();
  
  // Track loading states
  private loadingStateSubject = new BehaviorSubject<{[key: string]: boolean}>({});
  public loadingState$ = this.loadingStateSubject.asObservable();

  constructor() {
    // Enable service worker caching if available
    this.enableServiceWorkerCaching();
    
    // Clean up old cache entries periodically
    this.scheduleCleanup();
  }

  /**
   * Preload an image and cache it
   */
  preloadImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src)!);
    }

    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src)!;
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      // Set loading state
      this.updateLoadingState(src, true);
      
      img.onload = () => {
        this.imageCache.set(src, img);
        this.preloadedImages.add(src);
        this.loadingImages.delete(src);
        this.updateLoadingState(src, false);
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.loadingImages.delete(src);
        this.updateLoadingState(src, false);
        
        // For CORS errors or other failures, don't reject - just resolve with a placeholder
        // This prevents breaking the UI and allows images to load normally when displayed
        const placeholderImg = new Image();
        placeholderImg.src = src; // Keep original src for when it's actually used in DOM
        resolve(placeholderImg);
      };
      
      // Try without crossOrigin first for Firebase Storage compatibility
      // Don't set crossOrigin for Firebase Storage URLs to avoid CORS preflight
      if (!src.includes('firebasestorage.googleapis.com')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = src;
    });

    this.loadingImages.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * Preload multiple images
   */
  preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => 
      this.preloadImage(url).catch(error => {
        // Return a placeholder image element for failed loads
        const img = new Image();
        img.src = url;
        return img;
      })
    );
    return Promise.all(promises);
  }

  /**
   * Check if image is cached
   */
  isImageCached(src: string): boolean {
    return this.imageCache.has(src);
  }

  /**
   * Check if image is preloaded
   */
  isImagePreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }

  /**
   * Get cached image
   */
  getCachedImage(src: string): HTMLImageElement | null {
    return this.imageCache.get(src) || null;
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.imageCache.clear();
    this.preloadedImages.clear();
    this.loadingImages.clear();
    this.updateLoadingState({}, true);
  }

  /**
   * Remove specific image from cache
   */
  removeCachedImage(src: string): void {
    this.imageCache.delete(src);
    this.preloadedImages.delete(src);
    this.loadingImages.delete(src);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cachedCount: number;
    preloadedCount: number;
    loadingCount: number;
    totalSize: number;
  } {
    return {
      cachedCount: this.imageCache.size,
      preloadedCount: this.preloadedImages.size,
      loadingCount: this.loadingImages.size,
      totalSize: this.estimateCacheSize()
    };
  }

  /**
   * Preload critical images for app performance
   */
  preloadCriticalImages(apps: any[]): Promise<void> {
    const criticalImages: string[] = [];
    
    // Preload app icons (first 3 featured apps)
    apps.slice(0, 3).forEach(app => {
      if (app.iconUrl && this.shouldPreloadImage(app.iconUrl)) criticalImages.push(app.iconUrl);
      if (app.iconThumbUrl && this.shouldPreloadImage(app.iconThumbUrl)) criticalImages.push(app.iconThumbUrl);
      
      // Preload first screenshot of each app
      if (app.screenshots && app.screenshots.length > 0 && this.shouldPreloadImage(app.screenshots[0])) {
        criticalImages.push(app.screenshots[0]);
      }
    });

    // If no images to preload, return resolved promise
    if (criticalImages.length === 0) {
      return Promise.resolve();
    }

    return this.preloadImages(criticalImages)
      .then(() => {
        // Critical images preloaded successfully
      })
      .catch(error => {
        // Silent error handling for production
      });
  }

  /**
   * Check if an image should be preloaded (skip Firebase Storage in development)
   */
  private shouldPreloadImage(url: string): boolean {
    // In development, skip Firebase Storage URLs to avoid CORS issues
    if (this.isDevelopment() && url.includes('firebasestorage.googleapis.com')) {
      return false;
    }
    return true;
  }

  /**
   * Check if running in development mode
   */
  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Lazy preload non-critical images
   */
  lazyPreloadImages(apps: any[], startIndex: number = 3): void {
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadRemainingImages(apps, startIndex);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadRemainingImages(apps, startIndex);
      }, 1000);
    }
  }

  private preloadRemainingImages(apps: any[], startIndex: number): void {
    const remainingImages: string[] = [];
    
    apps.slice(startIndex).forEach(app => {
      if (app.iconUrl && !this.isImageCached(app.iconUrl) && this.shouldPreloadImage(app.iconUrl)) {
        remainingImages.push(app.iconUrl);
      }
      if (app.iconThumbUrl && !this.isImageCached(app.iconThumbUrl) && this.shouldPreloadImage(app.iconThumbUrl)) {
        remainingImages.push(app.iconThumbUrl);
      }
      
      // Preload remaining screenshots
      if (app.screenshots) {
        app.screenshots.slice(1, 3).forEach((screenshot: string) => {
          if (!this.isImageCached(screenshot) && this.shouldPreloadImage(screenshot)) {
            remainingImages.push(screenshot);
          }
        });
      }
    });

    if (remainingImages.length > 0) {
      this.preloadImages(remainingImages)
        .then(() => {
          // Additional images preloaded successfully
        })
        .catch(error => {
          // Silent error handling for production
        });
    }
  }

  private updateLoadingState(srcOrState: string | {[key: string]: boolean}, isLoading?: boolean): void {
    const currentState = this.loadingStateSubject.value;
    
    if (typeof srcOrState === 'string') {
      this.loadingStateSubject.next({
        ...currentState,
        [srcOrState]: isLoading || false
      });
    } else {
      this.loadingStateSubject.next(srcOrState);
    }
  }

  private estimateCacheSize(): number {
    // Rough estimation of cache size in bytes
    let totalSize = 0;
    this.imageCache.forEach(img => {
      // Estimate based on image dimensions and typical compression
      totalSize += (img.naturalWidth * img.naturalHeight * 4) / 8; // Rough estimate
    });
    return totalSize;
  }

  private enableServiceWorkerCaching(): void {
    if ('serviceWorker' in navigator && 'caches' in window) {
      // Register the image cache service worker
      navigator.serviceWorker.register('/sw-image-cache.js')
        .then(registration => {
          // Service worker registered successfully
        })
        .catch(error => {
          // Service worker registration failed silently
        });
    }
  }

  private scheduleCleanup(): void {
    // Clean up memory cache every hour
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60 * 60 * 1000); // 1 hour
  }

  private cleanupMemoryCache(): void {
    const maxCacheSize = 100; // Maximum number of images in memory
    
    if (this.imageCache.size > maxCacheSize) {
      const keysToDelete = Array.from(this.imageCache.keys()).slice(0, this.imageCache.size - maxCacheSize);
      keysToDelete.forEach(key => {
        this.imageCache.delete(key);
        this.preloadedImages.delete(key);
      });
    }
  }

  /**
   * Send message to service worker for cache management
   */
  private sendServiceWorkerMessage(type: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!('serviceWorker' in navigator)) {
        reject(new Error('Service Worker not supported'));
        return;
      }

      navigator.serviceWorker.ready.then(registration => {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        registration.active?.postMessage({ type, data }, [channel.port2]);
      }).catch(reject);
    });
  }

  /**
   * Get service worker cache information
   */
  async getServiceWorkerCacheInfo(): Promise<any> {
    try {
      return await this.sendServiceWorkerMessage('GET_CACHE_INFO');
    } catch (error) {
      return { cacheSize: 0, urls: [] };
    }
  }

  /**
   * Clear service worker cache
   */
  async clearServiceWorkerCache(): Promise<void> {
    try {
      await this.sendServiceWorkerMessage('CLEAR_CACHE');
      console.log('�️ Service worker cache cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear service worker cache:', error);
    }
  }

  /**
   * Create optimized image URLs with cache busting and format optimization
   */
  optimizeImageUrl(originalUrl: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }): string {
    if (!originalUrl) return originalUrl;

    // If it's a Firebase Storage URL, we can add optimization parameters
    if (originalUrl.includes('firebasestorage.googleapis.com')) {
      const url = new URL(originalUrl);
      
      if (options?.width) {
        url.searchParams.set('w', options.width.toString());
      }
      if (options?.height) {
        url.searchParams.set('h', options.height.toString());
      }
      if (options?.quality) {
        url.searchParams.set('q', options.quality.toString());
      }
      
      return url.toString();
    }

    return originalUrl;
  }
}
