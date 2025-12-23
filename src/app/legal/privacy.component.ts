import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    
    <div class="legal-container">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10">
            <div class="legal-content">
              <h1 class="legal-title">Privacy Policy</h1>
              <p class="legal-subtitle">Last updated: {{ lastUpdated | date:'longDate' }}</p>
              
              <div class="legal-section">
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, download apps, or contact us for support.</p>
                
                <h3>Personal Information</h3>
                <ul>
                  <li>Name and email address</li>
                  <li>Profile information</li>
                  <li>App download history</li>
                  <li>Reviews and ratings</li>
                </ul>
              </div>

              <div class="legal-section">
                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Communicate with you about products, services, and events</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </div>

              <div class="legal-section">
                <h2>3. Information Sharing</h2>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:</p>
                <ul>
                  <li>With service providers who assist us in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transaction</li>
                </ul>
              </div>

              <div class="legal-section">
                <h2>4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
              </div>

              <div class="legal-section">
                <h2>5. Data Retention</h2>
                <p>We retain your information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with legal obligations and resolve disputes.</p>
              </div>

              <div class="legal-section">
                <h2>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </div>

              <div class="legal-section">
                <h2>7. Cookies</h2>
                <p>We use cookies and similar tracking technologies to track activity on our platform and improve your experience. You can control cookies through your browser settings.</p>
              </div>

              <div class="legal-section">
                <h2>8. Third-Party Services</h2>
                <p>Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.</p>
              </div>

              <div class="legal-section">
                <h2>9. Children's Privacy</h2>
                <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
              </div>

              <div class="legal-section">
                <h2>10. Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
              </div>

              <div class="legal-section">
                <h2>11. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact&#64;example.com">contact&#64;example.com</a>.</p>
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

      h3 {
        color: #495057;
        font-size: 1.25rem;
        font-weight: 500;
        margin: 24px 0 12px 0;
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
export class PrivacyComponent {
  lastUpdated = new Date();
}
