import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    
    <div class="legal-container">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
            <div class="legal-content">
              <h1 class="legal-title">Terms & Conditions</h1>
              <p class="legal-subtitle">Last updated: {{ lastUpdated | date:'longDate' }}</p>
              
              <div class="legal-section">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Solidev Store, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>

              <div class="legal-section">
                <h2>2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of the materials on Solidev Store for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul>
                  <li>modify or copy the materials;</li>
                  <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial);</li>
                  <li>attempt to decompile or reverse engineer any software contained on Solidev Store;</li>
                  <li>remove any copyright or other proprietary notations from the materials;</li>
                </ul>
              </div>

              <div class="legal-section">
                <h2>3. Disclaimer</h2>
                <p>The materials on Solidev Store are provided on an 'as is' basis. Solidev Store makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              </div>

              <div class="legal-section">
                <h2>4. Limitations</h2>
                <p>In no event shall Solidev Store or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Solidev Store, even if Solidev Store or its representatives have been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
              </div>

              <div class="legal-section">
                <h2>5. Accuracy of Materials</h2>
                <p>The materials appearing on Solidev Store could include technical, typographical, or photographic errors. Solidev Store does not warrant that any of the materials on its website are accurate, complete, or current. Solidev Store may make changes to the materials contained on its website at any time without notice. However, Solidev Store does not make any commitment to update the materials.</p>
              </div>

              <div class="legal-section">
                <h2>6. User Accounts</h2>
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
              </div>

              <div class="legal-section">
                <h2>7. App Downloads</h2>
                <p>Apps available through Solidev Store are provided by third-party developers. Solidev Store is not responsible for the functionality, content, or any issues arising from the use of downloaded applications.</p>
              </div>

              <div class="legal-section">
                <h2>8. Governing Law</h2>
                <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Solidev Store operates.</p>
              </div>

              <div class="legal-section">
                <h2>9. Contact Information</h2>
                <p>If you have any questions about these Terms &amp; Conditions, please contact us at <a href="mailto:contact&#64;example.com">contact&#64;example.com</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .legal-container {
      min-height: 100vh;
      background-color: #f8f9fa;
      padding-top: 80px; // Account for fixed header height
    }

    .legal-content {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .legal-title {
      color: #212529;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .legal-subtitle {
      color: #6c757d;
      font-size: 1rem;
      margin-bottom: 32px;
    }

    .legal-section {
      margin-bottom: 32px;

      h2 {
        color: #495057;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 16px;
      }

      p, li {
        color: #495057;
        line-height: 1.6;
        margin-bottom: 16px;
      }

      ul {
        padding-left: 24px;
      }

      a {
        color: #007bff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    @media (max-width: 768px) {
      .legal-content {
        padding: 24px 20px;
      }
    }
  `]
})
export class TermsComponent {
  lastUpdated = new Date();
}
