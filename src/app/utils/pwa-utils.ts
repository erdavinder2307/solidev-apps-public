/**
 * Utility functions for PWA and device detection
 */

/**
 * Detects if the current device is running iOS
 * @returns true if the device is iOS (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detects if the current browser is Safari
 * @returns true if the browser is Safari
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Detects if the current context is iOS Safari (for fallback instructions)
 * @returns true if running on iOS Safari
 */
export function isIOSSafari(): boolean {
  return isIOS() && isSafari();
}

/**
 * Checks if PWA installation is supported
 * @returns true if service workers and push manager are supported
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Checks if the app is currently running in standalone mode (installed as PWA)
 * @returns true if the app is running in standalone mode
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for standard display mode
  const isStandardStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for iOS Safari standalone mode
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  return isStandardStandalone || isIOSStandalone;
}

/**
 * Gets the platform-specific installation instructions
 * @returns object with platform and instructions
 */
export function getInstallInstructions(): { platform: string; instructions: string } {
  if (isIOSSafari()) {
    return {
      platform: 'ios-safari',
      instructions: 'Tap the share button then "Add to Home Screen"'
    };
  }
  
  if (/Android/i.test(navigator.userAgent)) {
    return {
      platform: 'android',
      instructions: 'Tap "Install" when prompted, or use the browser menu'
    };
  }
  
  return {
    platform: 'desktop',
    instructions: 'Click "Install" when prompted, or look for the install icon in your browser'
  };
}
