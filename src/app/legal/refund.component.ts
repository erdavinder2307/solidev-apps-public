import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="legal-content">
              <h1 class="mb-4">Refund Policy</h1>
              
              <div class="policy-section">
                <h2>Overview</h2>
                <p>At Solidev Store, we want you to be completely satisfied with your app purchases. This Refund Policy outlines the circumstances under which refunds may be issued and the process for requesting them.</p>
              </div>

              <div class="policy-section">
                <h2>Contact Information</h2>
                <p>For refund requests and questions about this policy, please contact:</p>
                <ul>
                  <li>Email: <a href="mailto:contact&#64;example.com">contact&#64;example.com</a></li>
                  <li>Subject line: "Refund Request - [Order Number]"</li>
                  <li>Response time: Within 24 hours during business days</li>
                </ul>
              </div>

              <div class="mt-5 text-center">
                <a routerLink="/" class="btn btn-primary me-3">Back to Store</a>
                <a routerLink="/legal/contact" class="btn btn-outline-primary">Contact Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      background-color: var(--bs-light);
      min-height: 100vh;
      padding-top: 80px; // Account for fixed header height
    }
    
    .legal-content {
      background: white;
      border-radius: 15px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .policy-section {
      margin-bottom: 2rem;
    }
    
    .policy-section h2 {
      color: var(--bs-primary);
      font-size: 1.25rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--bs-primary);
      padding-bottom: 0.5rem;
    }
  `]
})
export class RefundComponent { }