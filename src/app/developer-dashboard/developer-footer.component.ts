import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'developer-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="developer-footer">
      <div class="footer-content d-flex justify-content-between align-items-center">
        <div class="footer-info">
          <span class="text-muted small">
            &copy; 2025 Solidev Developer Portal. All rights reserved.
          </span>
        </div>
        <div class="footer-links d-flex gap-3">
          <a href="#" class="footer-link">Documentation</a>
          <a href="#" class="footer-link">Support</a>
          <a href="#" class="footer-link">API</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .developer-footer {
      position: fixed;
      left: 280px;
      right: 0;
      bottom: 0;
      z-index: 101;
      background: #ffffff;
      border-top: 1px solid #e9ecef;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      transition: left 0.3s ease;
    }

    .footer-content {
      padding: 12px 24px;
    }

    .footer-info .text-muted {
      font-size: 0.85rem;
    }

    .footer-link {
      color: #6c757d;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: #667eea;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .developer-footer {
        left: 0;
        padding: 8px 16px;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        text-align: center;
      }
      
      .footer-links {
        gap: 16px !important;
      }
    }
  `]
})
export class DeveloperFooterComponent {}
