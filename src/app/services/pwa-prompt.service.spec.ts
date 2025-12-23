import { TestBed } from '@angular/core/testing';
import { PwaPromptService } from './pwa-prompt.service';

describe('PwaPromptService', () => {
  let service: PwaPromptService;
  let mockEvent: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaPromptService);

    // Mock the beforeinstallprompt event
    mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      prompt: jasmine.createSpy('prompt').and.returnValue(Promise.resolve()),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };

    // Mock window.addEventListener
    spyOn(window, 'addEventListener').and.callFake((event: string, callback: any) => {
      if (event === 'beforeinstallprompt') {
        // Simulate the event being triggered
        setTimeout(() => callback(mockEvent), 0);
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit true when beforeinstallprompt event is triggered', (done) => {
    service.canInstall$.subscribe(canInstall => {
      if (canInstall) {
        expect(canInstall).toBe(true);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        done();
      }
    });

    // Trigger the service initialization
    (service as any).initializeService();
  });

  it('should successfully install the app when install() is called', async () => {
    // Set up the deferred prompt
    (service as any).deferredPrompt = mockEvent;
    (service as any).installPromptEvent$.next(true);

    const result = await service.install();

    expect(mockEvent.prompt).toHaveBeenCalled();
    expect(result).toEqual({ outcome: 'accepted' });
  });

  it('should return null when install() is called without deferred prompt', async () => {
    (service as any).deferredPrompt = null;

    const result = await service.install();

    expect(result).toBeNull();
    expect(mockEvent.prompt).not.toHaveBeenCalled();
  });

  it('should detect iOS correctly', () => {
    // Mock navigator.userAgent for iOS
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    expect(service.isIOS).toBe(true);
  });

  it('should detect Safari correctly', () => {
    // Mock navigator.userAgent for Safari
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15'
    });

    expect(service.isSafari).toBe(true);
  });

  it('should detect PWA support correctly', () => {
    // Mock service worker support
    Object.defineProperty(navigator, 'serviceWorker', { value: {} });
    Object.defineProperty(window, 'PushManager', { value: {} });

    expect(service.isInstallSupported).toBe(true);
  });

  it('should handle installation errors gracefully', async () => {
    const errorEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      prompt: jasmine.createSpy('prompt').and.returnValue(Promise.reject(new Error('Installation failed')))
    };

    (service as any).deferredPrompt = errorEvent;

    const result = await service.install();

    expect(result).toBeNull();
  });

  it('should clean up after installation', async () => {
    (service as any).deferredPrompt = mockEvent;
    (service as any).installPromptEvent$.next(true);

    await service.install();

    expect((service as any).deferredPrompt).toBeNull();
    
    service.canInstall$.subscribe(canInstall => {
      expect(canInstall).toBe(false);
    });
  });
});
