import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';

import { InstallPromptComponent } from './install-prompt.component';
import { PwaPromptService } from '../../services/pwa-prompt.service';

describe('InstallPromptComponent', () => {
  let component: InstallPromptComponent;
  let fixture: ComponentFixture<InstallPromptComponent>;
  let mockPwaPromptService: jasmine.SpyObj<PwaPromptService>;
  let canInstallSubject: BehaviorSubject<boolean>;
  let isInstalledSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    canInstallSubject = new BehaviorSubject<boolean>(false);
    isInstalledSubject = new BehaviorSubject<boolean>(false);

    mockPwaPromptService = jasmine.createSpyObj('PwaPromptService', 
      ['install'], 
      {
        canInstall$: canInstallSubject.asObservable(),
        isAppInstalled$: isInstalledSubject.asObservable(),
        isIOSSafari: false
      }
    );

    await TestBed.configureTestingModule({
      imports: [
        InstallPromptComponent,
        MatSnackBarModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PwaPromptService, useValue: mockPwaPromptService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InstallPromptComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show prompt when can install and not installed', () => {
    canInstallSubject.next(true);
    isInstalledSubject.next(false);
    fixture.detectChanges();

    expect(component.showPrompt).toBe(true);
    expect(component.canInstall).toBe(true);
    expect(component.isInstalled).toBe(false);
  });

  it('should hide prompt when app is installed', () => {
    canInstallSubject.next(true);
    isInstalledSubject.next(true);
    fixture.detectChanges();

    expect(component.showPrompt).toBe(false);
    expect(component.isInstalled).toBe(true);
  });

  it('should call install service when install button is clicked', async () => {
    mockPwaPromptService.install.and.returnValue(Promise.resolve({ outcome: 'accepted' }));
    component.canInstall = true;
    component.showPrompt = true;
    fixture.detectChanges();

    await component.installApp();

    expect(mockPwaPromptService.install).toHaveBeenCalled();
  });

  it('should handle install rejection gracefully', async () => {
    mockPwaPromptService.install.and.returnValue(Promise.resolve({ outcome: 'dismissed' }));
    component.canInstall = true;

    await component.installApp();

    expect(component.isInstalling).toBe(false);
    expect(component.showPrompt).toBe(false);
  });

  it('should handle install errors gracefully', async () => {
    mockPwaPromptService.install.and.returnValue(Promise.resolve(null));
    component.canInstall = true;

    await component.installApp();

    expect(component.isInstalling).toBe(false);
  });

  it('should dismiss prompt when dismiss button is clicked', () => {
    component.showPrompt = true;
    
    component.dismissPrompt();

    expect(component.showPrompt).toBe(false);
  });

  it('should show iOS prompt for iOS Safari users', () => {
    Object.defineProperty(mockPwaPromptService, 'isIOSSafari', { value: true });
    component.isIOSSafari = true;
    isInstalledSubject.next(false);
    fixture.detectChanges();

    expect(component.showPrompt).toBe(true);
  });

  it('should not install when already installing', async () => {
    component.isInstalling = true;
    component.canInstall = true;

    await component.installApp();

    expect(mockPwaPromptService.install).not.toHaveBeenCalled();
  });

  it('should not install when cannot install', async () => {
    component.canInstall = false;
    component.isInstalling = false;

    await component.installApp();

    expect(mockPwaPromptService.install).not.toHaveBeenCalled();
  });
});
