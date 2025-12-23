import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    
    <div class="not-found-container">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-8 col-lg-6">
            <div class="not-found-content text-center">
              <!-- 404 Animation -->
              <div class="error-animation mb-4">
                <div class="error-code">404</div>
                <div class="error-phone">
                  <i class="fas fa-mobile-alt"></i>
                </div>
              </div>

              <!-- Error Message -->
              <h1 class="error-title">Oops! Page Not Found</h1>
              <p class="error-description">
                The page you're looking for seems to have gone missing. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>

              <!-- Action Buttons -->
              <div class="error-actions">
                <button class="btn btn-primary btn-lg me-3" routerLink="/">
                  <i class="fas fa-home me-2"></i>
                  Go Home
                </button>
                <button class="btn btn-outline-secondary btn-lg" (click)="goBack()">
                  <i class="fas fa-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>

              <!-- Helpful Links -->
              <div class="helpful-links">
                <h5>Looking for something specific?</h5>
                <div class="quick-links">
                  <a routerLink="/categories" class="quick-link">
                    <i class="fas fa-th-large"></i>
                    Browse Categories
                  </a>
                  <a routerLink="/search" class="quick-link">
                    <i class="fas fa-search"></i>
                    Search Apps
                  </a>
                  <a routerLink="/profile" class="quick-link">
                    <i class="fas fa-user"></i>
                    My Profile
                  </a>
                  <a routerLink="/legal/contact" class="quick-link">
                    <i class="fas fa-envelope"></i>
                    Contact Support
                  </a>
                </div>
              </div>

              <!-- Popular Apps -->
              <div class="popular-suggestions">
                <h5>Or check out these popular apps:</h5>
                <div class="suggestions-grid">
                  <div class="suggestion-app" routerLink="/solid-care">
                    <div class="app-icon">
                      <i class="fas fa-heart"></i>
                    </div>
                    <span>Solid Care</span>
                  </div>
                  <div class="suggestion-app" routerLink="/decide-mate-pro">
                    <div class="app-icon">
                      <i class="fas fa-balance-scale"></i>
                    </div>
                    <span>Decide Mate Pro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      padding: 40px 0;
    }

    .not-found-content {
      background: white;
      border-radius: 24px;
      padding: 60px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .error-animation {
      position: relative;
      margin-bottom: 40px;

      .error-code {
        font-size: 8rem;
        font-weight: 900;
        color: #f8f9fa;
        text-shadow: 0 0 0 #007bff;
        animation: float 3s ease-in-out infinite;
        margin-bottom: -20px;
      }

      .error-phone {
        font-size: 4rem;
        color: #007bff;
        animation: swing 2s ease-in-out infinite;
        transform-origin: top center;
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @keyframes swing {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }

    .error-title {
      color: #212529;
      font-weight: 700;
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .error-description {
      color: #6c757d;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 40px;
    }

    .error-actions {
      margin-bottom: 50px;

      .btn {
        min-width: 140px;
        border-radius: 12px;
      }
    }

    .helpful-links {
      margin-bottom: 40px;

      h5 {
        color: #495057;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .quick-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;

        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 16px;
          background: #f8f9fa;
          border-radius: 12px;
          text-decoration: none;
          color: #495057;
          transition: all 0.3s ease;

          &:hover {
            background: #007bff;
            color: white;
            transform: translateY(-2px);
            text-decoration: none;
          }

          i {
            font-size: 1.5rem;
            margin-bottom: 8px;
          }

          span {
            font-size: 0.9rem;
            font-weight: 500;
          }
        }
      }
    }

    .popular-suggestions {
      h5 {
        color: #495057;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .suggestions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;

        .suggestion-app {
          display: flex;
          align-items: center;
          padding: 16px;
          background: linear-gradient(45deg, #007bff, #6610f2);
          border-radius: 12px;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
            text-decoration: none;
            color: white;
          }

          .app-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 1.2rem;
          }

          span {
            font-weight: 500;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .not-found-content {
        padding: 40px 24px;
      }

      .error-code {
        font-size: 6rem !important;
      }

      .error-phone {
        font-size: 3rem !important;
      }

      .error-title {
        font-size: 2rem;
      }

      .error-actions {
        .btn {
          display: block;
          width: 100%;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .helpful-links {
        .quick-links {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .popular-suggestions {
        .suggestions-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  `]
})
export class NotFoundComponent {
  goBack() {
    window.history.back();
  }
}
