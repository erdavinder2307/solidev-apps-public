import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'developer-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="developer-header d-flex align-items-center px-4 shadow-sm">
      <button class="sidebar-toggle-btn me-3" (click)="toggleSidebar()" [title]="sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'">
        <i class="bi" [class.bi-list]="!sidebarVisible" [class.bi-x-lg]="sidebarVisible"></i>
      </button>
      
      <div class="brand-section d-flex align-items-center">
        <div class="brand-icon me-3">
          <i class="bi bi-code-slash"></i>
        </div>
        <div class="brand-text">
          <h5 class="mb-0 fw-bold">Developer Portal</h5>
          <small class="text-muted">Build & Manage Apps</small>
        </div>
      </div>
      
      <div class="header-actions ms-auto d-flex align-items-center gap-3">
        <div class="notifications position-relative">
          <button class="btn btn-light btn-sm rounded-pill px-3">
            <i class="bi bi-bell me-1"></i>
            <span class="badge bg-danger rounded-pill ms-1">3</span>
          </button>
        </div>
        
        <div class="user-profile d-flex align-items-center">
          <div class="user-avatar me-2">
            <div class="avatar-circle">
              <i class="bi bi-person-circle"></i>
            </div>
          </div>
          <div class="user-info d-none d-md-block">
            <div class="fw-semibold text-dark">John Developer</div>
            <small class="text-muted">Administrator</small>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .developer-header {
      height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      color: white;
    }

    .sidebar-toggle-btn {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      border-radius: 8px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .sidebar-toggle-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: scale(1.05);
    }

    .sidebar-toggle-btn:active {
      transform: scale(0.95);
    }

    .sidebar-toggle-btn i {
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }

    .sidebar-toggle-btn:hover i {
      transform: rotate(180deg);
    }

    .brand-section {
      color: white;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .brand-text h5 {
      color: white;
      margin: 0;
    }

    .brand-text small {
      color: rgba(255,255,255,0.8);
    }

    .header-actions .btn {
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .notifications .badge {
      font-size: 0.65rem;
      padding: 0.25em 0.5em;
    }

    .user-avatar .avatar-circle {
      width: 42px;
      height: 42px;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      border: 2px solid rgba(255,255,255,0.2);
    }

    .user-info {
      line-height: 1.2;
    }

    .user-info .fw-semibold {
      color: white;
      font-size: 0.9rem;
    }

    .user-info small {
      color: rgba(255,255,255,0.8);
      font-size: 0.75rem;
    }

    @media (max-width: 768px) {
      .developer-header {
        height: 60px;
        padding: 0 1rem;
      }
      
      .brand-icon {
        width: 36px;
        height: 36px;
        font-size: 1.2rem;
      }
      
      .brand-text h5 {
        font-size: 1rem;
      }
      
      .user-avatar .avatar-circle {
        width: 36px;
        height: 36px;
        font-size: 1.2rem;
      }
    }
  `]
})
export class DeveloperHeaderComponent implements OnInit, OnDestroy {
  sidebarVisible = true;
  private sidebarStateListener?: () => void;

  ngOnInit() {
    // Get initial sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('developer-sidebar-visible');
    if (savedSidebarState !== null) {
      this.sidebarVisible = JSON.parse(savedSidebarState);
    }
    
    // Listen for sidebar state changes
    this.sidebarStateListener = () => {
      // Toggle the local state
      this.sidebarVisible = !this.sidebarVisible;
    };
    window.addEventListener('toggle-developer-sidebar', this.sidebarStateListener);
  }

  ngOnDestroy() {
    if (this.sidebarStateListener) {
      window.removeEventListener('toggle-developer-sidebar', this.sidebarStateListener);
    }
  }

  toggleSidebar() {
    window.dispatchEvent(new CustomEvent('toggle-developer-sidebar'));
  }
}
