import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeveloperHeaderComponent } from './developer-header.component';
import { DeveloperSidebarComponent } from './developer-sidebar.component';
import { DeveloperFooterComponent } from './developer-footer.component';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'developer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DeveloperHeaderComponent,
    DeveloperSidebarComponent,
    DeveloperFooterComponent
  ],
  template: `
    <developer-header></developer-header>
    <div class="developer-main d-flex" [class.sidebar-hidden]="!sidebarVisible">
      <!-- Mobile overlay -->
      <div 
        class="sidebar-overlay" 
        [class.active]="sidebarVisible && isMobile"
        (click)="onOverlayClick()"></div>
      
      <developer-sidebar 
        *ngIf="sidebarVisible" 
        class="sidebar-container"
        [class.mobile-visible]="isMobile && sidebarVisible"
        [@slideInOut]></developer-sidebar>
      <main class="flex-grow-1 p-4" [style.marginLeft]="sidebarVisible && !isMobile ? '280px' : '0'">
        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
    <developer-footer></developer-footer>
  `,
  styles: [
    `.developer-main { 
      min-height: calc(100vh - 70px); 
      margin-top: 70px;
      position: relative;
    }
     main { 
       background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
       min-height: calc(100vh - 70px); 
       transition: margin-left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
       padding-top: 2rem;
       position: relative;
       z-index: 1;
     }
     .main-content {
       max-width: 1200px;
       margin: 0 auto;
     }
     .sidebar-hidden main { 
       margin-left: 0 !important; 
     }
     
     .sidebar-container {
       position: fixed;
       top: 70px;
       left: 0;
       height: calc(100vh - 70px);
       width: 280px;
       z-index: 1000;
       transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
     }
     
     /* Overlay for mobile */
     .sidebar-overlay {
       position: fixed;
       top: 70px;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.5);
       z-index: 999;
       opacity: 0;
       visibility: hidden;
       transition: all 0.3s ease;
     }
     
     .sidebar-overlay.active {
       opacity: 1;
       visibility: visible;
     }
     
     @media (max-width: 768px) {
       .developer-main {
         margin-top: 60px;
       }
       main {
         min-height: calc(100vh - 60px);
         padding: 1rem;
         margin-left: 0 !important;
       }
       
       .sidebar-container {
         top: 60px;
         height: calc(100vh - 60px);
         transform: translateX(-100%);
         box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
       }
       
       .sidebar-container.mobile-visible {
         transform: translateX(0);
       }
     }
    `
  ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class DeveloperDashboardComponent implements OnDestroy {
  sidebarVisible = true;
  isMobile = false;
  private sidebarToggleListener: () => void;

  constructor() {
    // Check if mobile
    this.checkMobile();
    
    // Load saved sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('developer-sidebar-visible');
    if (savedSidebarState !== null) {
      this.sidebarVisible = JSON.parse(savedSidebarState);
    }
    
    // Set initial sidebar state based on screen size
    if (this.isMobile) {
      this.sidebarVisible = false;
    }

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.checkMobile();
      if (this.isMobile && this.sidebarVisible) {
        // Auto-hide sidebar on mobile when resizing to mobile view
        this.sidebarVisible = false;
      }
    });

    // Listen for sidebar toggle events
    this.sidebarToggleListener = () => {
      this.toggleSidebar();
    };
    window.addEventListener('toggle-developer-sidebar', this.sidebarToggleListener);
  }

  ngOnDestroy() {
    // Clean up event listeners
    window.removeEventListener('toggle-developer-sidebar', this.sidebarToggleListener);
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    // Save state to localStorage
    localStorage.setItem('developer-sidebar-visible', JSON.stringify(this.sidebarVisible));
  }

  // Close sidebar when clicking outside on mobile
  onOverlayClick() {
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
  }

  // Keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl/Cmd + \ to toggle sidebar
    if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
      event.preventDefault();
      this.toggleSidebar();
    }
    
    // Escape key to close sidebar on mobile
    if (event.key === 'Escape' && this.isMobile && this.sidebarVisible) {
      event.preventDefault();
      this.sidebarVisible = false;
    }
  }
}
