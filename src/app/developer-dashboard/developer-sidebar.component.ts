import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'developer-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="developer-sidebar">
      <div class="sidebar-content">
        <!-- User Profile Section -->
        <div class="user-profile-section p-4 border-bottom">
          <div class="d-flex align-items-center">
            <div class="profile-avatar me-3" *ngIf="!user?.photoURL">
              {{ getUserInitials() }}
            </div>
            <img 
              *ngIf="user?.photoURL" 
              [src]="user!.photoURL" 
              alt="Profile" 
              class="profile-avatar me-3"
              (error)="onAvatarError($event)">
            <div class="profile-info">
              <div class="fw-semibold text-dark">{{ getDisplayName() }}</div>
              <small class="text-muted">{{ user?.email || 'Pro Developer' }}</small>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav flex-column py-3">
          <div class="nav-section">
            <small class="nav-section-title px-4 py-2 text-uppercase fw-semibold text-muted">Main</small>
            
            <a class="nav-link" [class.active]="isActive('dashboard')" (click)="navigate('dashboard')">
              <i class="bi bi-grid-1x2 me-3"></i>
              <span>Dashboard</span>
              <div class="nav-indicator"></div>
            </a>
            
            <a class="nav-link" [class.active]="isActive('apps')" (click)="navigate('apps')">
              <i class="bi bi-app me-3"></i>
              <span>My Apps</span>
              <span class="badge bg-primary rounded-pill ms-auto">12</span>
              <div class="nav-indicator"></div>
            </a>
            
            <a class="nav-link" [class.active]="isActive('users')" (click)="navigate('users')">
              <i class="bi bi-people me-3"></i>
              <span>Users</span>
              <div class="nav-indicator"></div>
            </a>
          </div>

          <div class="nav-section mt-4">
            <small class="nav-section-title px-4 py-2 text-uppercase fw-semibold text-muted">Tools</small>
            
            <a class="nav-link" [class.active]="isActive('analytics')" (click)="navigate('analytics')">
              <i class="bi bi-graph-up me-3"></i>
              <span>Analytics</span>
              <div class="nav-indicator"></div>
            </a>
            
            <a class="nav-link" [class.active]="isActive('settings')" (click)="navigate('settings')">
              <i class="bi bi-gear me-3"></i>
              <span>Settings</span>
              <div class="nav-indicator"></div>
            </a>
          </div>
        </nav>

        <!-- Logout Section -->
        <div class="sidebar-footer mt-auto p-4 border-top">
          <a class="nav-link logout-link" href="#" (click)="logout($event)">
            <i class="bi bi-box-arrow-right me-3"></i>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .developer-sidebar {
      width: 280px;
      min-height: 100vh;
      position: fixed;
      top: 70px;
      left: 0;
      z-index: 100;
      background: #ffffff;
      border-right: 1px solid #e9ecef;
      box-shadow: 2px 0 10px rgba(0,0,0,0.05);
    }

    .sidebar-content {
      height: calc(100vh - 70px);
      display: flex;
      flex-direction: column;
    }

    .user-profile-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .profile-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
      object-fit: cover;
    }

    .profile-avatar img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profile-info .fw-semibold {
      font-size: 0.95rem;
      color: #495057;
    }

    .profile-info small {
      font-size: 0.8rem;
    }

    .nav-section-title {
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .nav-link {
      position: relative;
      display: flex;
      align-items: center;
      padding: 12px 24px;
      color: #6c757d;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      background: none;
      margin: 2px 12px;
      border-radius: 8px;
    }

    .nav-link:hover {
      background: #f8f9fa;
      color: #495057;
      transform: translateX(4px);
    }

    .nav-link.active {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      color: #667eea;
      font-weight: 600;
    }

    .nav-link.active .nav-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0 4px 4px 0;
    }

    .nav-link i {
      font-size: 1.1rem;
      width: 24px;
      text-align: center;
    }

    .nav-link .badge {
      font-size: 0.7rem;
      padding: 0.25em 0.5em;
    }

    .logout-link {
      color: #dc3545 !important;
      margin: 0 12px;
    }

    .logout-link:hover {
      background: #dc354515 !important;
      color: #dc3545 !important;
    }

    .sidebar-footer {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .developer-sidebar {
        top: 60px;
        width: 260px;
      }
      
      .sidebar-content {
        height: calc(100vh - 60px);
      }
    }
  `]
})
export class DeveloperSidebarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSubscription!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to user authentication state
    this.userSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      
      // If user is not logged in, redirect to login
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getDisplayName(): string {
    if (this.user?.displayName) {
      return this.user.displayName;
    }
    if (this.user?.email) {
      return this.user.email.split('@')[0];
    }
    return 'Developer';
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    if (name === 'Developer') {
      return 'D';
    }
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onAvatarError(event: any): void {
    // Hide the broken image and show the default avatar
    event.target.style.display = 'none';
  }

  navigate(section: string) {
    if (section === 'apps') {
      this.router.navigate(['/developer-dashboard/list']);
    } else if (section === 'dashboard') {
      this.router.navigate(['/developer-dashboard']);
    } // Add more navigation as needed
  }

  isActive(section: string): boolean {
    if (section === 'apps') {
      return this.router.url === '/developer-dashboard/list' || this.router.url.startsWith('/developer-dashboard/add-app');
    }
    if (section === 'dashboard') {
      return this.router.url === '/developer-dashboard';
    }
    return false;
  }

  async logout(event: Event) {
    event.preventDefault();
    
    const confirmLogout = window.confirm('Are you sure you want to sign out?');
    if (confirmLogout) {
      try {
        await this.authService.logout();
        // Navigate to home page after logout
        this.router.navigate(['/']);
      } catch (error) {
        // Production: Error logged
        alert('Error signing out. Please try again.');
      }
    }
  }
}
