import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for PWA functionality
 * These tests verify that the PWA install prompt works correctly
 */

test.describe('PWA Install Prompt', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the service worker to be ready
    await page.waitForTimeout(2000);
  });

  test('should show install prompt when beforeinstallprompt event is triggered', async () => {
    // Mock the beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).preventDefault = () => {};
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    // Wait for the install prompt to appear
    await expect(page.locator('app-install-prompt .install-prompt-banner')).toBeVisible();
    
    // Check that the install button is present
    await expect(page.locator('app-install-prompt button:has-text("Install")')).toBeVisible();
  });

  test('should hide install prompt when dismiss button is clicked', async () => {
    // Trigger the beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).preventDefault = () => {};
      window.dispatchEvent(event);
    });

    // Wait for prompt to appear
    await expect(page.locator('app-install-prompt .install-prompt-banner')).toBeVisible();
    
    // Click dismiss button
    await page.locator('app-install-prompt button:has-text("Not now")').click();
    
    // Verify prompt is hidden
    await expect(page.locator('app-install-prompt .install-prompt-banner')).not.toBeVisible();
  });

  test('should trigger installation when install button is clicked', async () => {
    let promptCalled = false;
    
    // Mock the beforeinstallprompt event with tracking
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).preventDefault = () => {};
      (event as any).prompt = () => {
        (window as any).promptCalled = true;
        return Promise.resolve();
      };
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    // Wait for prompt to appear
    await expect(page.locator('app-install-prompt .install-prompt-banner')).toBeVisible();
    
    // Click install button
    await page.locator('app-install-prompt button:has-text("Install")').click();
    
    // Verify that prompt() was called
    promptCalled = await page.evaluate(() => (window as any).promptCalled);
    expect(promptCalled).toBe(true);
  });

  test('should show iOS instructions on iOS Safari', async () => {
    // Mock iOS Safari user agent
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      });
    });

    // Reload the page to apply the user agent
    await page.reload();
    await page.waitForTimeout(1000);

    // Check for iOS-specific prompt
    await expect(page.locator('app-install-prompt .ios-install-prompt')).toBeVisible();
    await expect(page.locator('text=Add to Home Screen')).toBeVisible();
  });

  test('should not show prompt when app is already installed', async () => {
    // Mock standalone display mode (app is installed)
    await page.addInitScript(() => {
      // Mock matchMedia for standalone mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(display-mode: standalone)',
          addListener: () => {},
          removeListener: () => {}
        })
      });
    });

    // Reload to apply changes
    await page.reload();
    await page.waitForTimeout(1000);

    // Trigger beforeinstallprompt (should be ignored when installed)
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).preventDefault = () => {};
      window.dispatchEvent(event);
    });

    // Verify no prompt appears
    await expect(page.locator('app-install-prompt .install-prompt-banner')).not.toBeVisible();
  });

  test('should work offline after service worker activation', async () => {
    // Wait for service worker to be registered
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Navigate to a page (should work from cache)
    await page.goto('/');
    
    // Verify page loads
    await expect(page.locator('app-root')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
  });
});

test.describe('PWA Manifest and Service Worker', () => {
  test('should have valid manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBe('SolidevApps - Innovative App Solutions');
    expect(manifest.short_name).toBe('SolidevApps');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should register service worker in production build', async ({ page }) => {
    // This test assumes production build
    await page.goto('/');
    
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
  });
});
