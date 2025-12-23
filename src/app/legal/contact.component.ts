import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../toast/toast.component';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '../firebase.config';
import { ToastService } from '../services/toast.service';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <app-header></app-header>
    <app-toast></app-toast>
    
    <div class="contact-container">
      <div class="container py-5">
        <div class="row">
          <!-- Contact Information -->
          <div class="col-12 col-lg-5">
            <div class="contact-info">
              <h1 class="contact-title">Get in Touch</h1>
              <p class="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <div class="contact-methods">
                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="method-content">
                    <h5>Email Us</h5>
                    <p>contact@example.com</p>
                    <small>We'll respond within 24 hours</small>
                  </div>
                </div>

                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="method-content">
                    <h5>Business Hours</h5>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <small>Saturday - Sunday: 10:00 AM - 4:00 PM</small>
                  </div>
                </div>

                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="method-content">
                    <h5>Office</h5>
                    <p>Solidev ElectroSoft</p>
                    <small>Next57 Coworking, Cabin No - 11,  C205 Sm Heights Industrial Area Phase 8b Mohali, 140308</small>
                  </div>
                </div>
              </div>

              <div class="social-links">
                <h5>Follow Us</h5>
                <div class="social-icons">
                  <a (click)="navigateToComingSoon('twitter')" class="social-icon"><i class="fab fa-twitter"></i></a>
                  <a (click)="navigateToComingSoon('facebook')" class="social-icon"><i class="fab fa-facebook"></i></a>
                  <a (click)="navigateToComingSoon('linkedin')" class="social-icon"><i class="fab fa-linkedin"></i></a>
                  <a (click)="navigateToComingSoon('github')" class="social-icon"><i class="fab fa-github"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="col-12 col-lg-7">
            <div class="contact-form-container">
              <form (ngSubmit)="submitForm()" #contactForm="ngForm" class="contact-form">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="name" class="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="name"
                      name="name"
                      [(ngModel)]="formData.name"
                      #nameField="ngModel"
                      required
                      minlength="2"
                      placeholder="Enter your full name"
                      [class.is-invalid]="nameField.invalid && nameField.touched">
                    <div class="invalid-feedback" *ngIf="nameField.invalid && nameField.touched">
                      <small *ngIf="nameField.errors?.['required']">Full name is required.</small>
                      <small *ngIf="nameField.errors?.['minlength']">Name must be at least 2 characters long.</small>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="email" class="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email"
                      name="email"
                      [(ngModel)]="formData.email"
                      #emailField="ngModel"
                      required
                      email
                      placeholder="your@email.com"
                      [class.is-invalid]="emailField.invalid && emailField.touched">
                    <div class="invalid-feedback" *ngIf="emailField.invalid && emailField.touched">
                      <small *ngIf="emailField.errors?.['required']">Email address is required.</small>
                      <small *ngIf="emailField.errors?.['email']">Please enter a valid email address.</small>
                    </div>
                  </div>
                  <div class="col-12">
                    <label for="phone" class="form-label">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="phone"
                      name="phone"
                      [(ngModel)]="formData.phone"
                      #phoneField="ngModel"
                      placeholder="+91 9876543210"
                      pattern="^[+]?[0-9\\s\\-()]{10,15}$"
                      [class.is-invalid]="phoneField.invalid && phoneField.touched && phoneField.value">
                    <div class="invalid-feedback" *ngIf="phoneField.invalid && phoneField.touched && phoneField.value">
                      <small>Please enter a valid phone number.</small>
                    </div>
                  </div>
                  <div class="col-12">
                    <label for="company" class="form-label">Company/Organization (Optional)</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="company"
                      name="company"
                      [(ngModel)]="formData.company"
                      placeholder="Your company or organization">
                  </div>
                  <div class="col-12">
                    <label for="subject" class="form-label">Subject *</label>
                    <select 
                      class="form-select" 
                      id="subject"
                      name="subject"
                      [(ngModel)]="formData.subject"
                      #subjectField="ngModel"
                      required
                      [class.is-invalid]="subjectField.invalid && subjectField.touched">
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="app-issue">App Issue</option>
                      <option value="developer">Developer Support</option>
                      <option value="legal">Legal Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="subjectField.invalid && subjectField.touched">
                      <small>Please select a subject for your inquiry.</small>
                    </div>
                  </div>
                  <div class="col-12">
                    <label for="message" class="form-label">Message *</label>
                    <textarea 
                      class="form-control" 
                      id="message"
                      name="message"
                      [(ngModel)]="formData.message"
                      #messageField="ngModel"
                      required
                      minlength="10"
                      maxlength="1000"
                      rows="6"
                      placeholder="Please describe your inquiry in detail..."
                      [class.is-invalid]="messageField.invalid && messageField.touched"></textarea>
                    <div class="invalid-feedback" *ngIf="messageField.invalid && messageField.touched">
                      <small *ngIf="messageField.errors?.['required']">Message is required.</small>
                      <small *ngIf="messageField.errors?.['minlength']">Message must be at least 10 characters long.</small>
                      <small *ngIf="messageField.errors?.['maxlength']">Message cannot exceed 1000 characters.</small>
                    </div>
                    <div class="form-text">{{ formData.message.length }}/1000 characters</div>
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="privacy"
                        name="privacy"
                        [(ngModel)]="formData.agreeToPrivacy"
                        required>
                      <label class="form-check-label" for="privacy">
                        I agree to the <a href="/legal/privacy" target="_blank">Privacy Policy</a> and <a href="/legal/terms" target="_blank">Terms of Service</a> *
                      </label>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    [disabled]="!contactForm.valid || submitting">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!submitting" class="fas fa-paper-plane me-2"></i>
                    {{ submitting ? 'Sending...' : 'Send Message' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="row mt-5">
          <div class="col-12">
            <div class="faq-section">
              <h2 class="text-center mb-4">Frequently Asked Questions</h2>
              <div class="row g-4">
                <div class="col-12 col-md-6">
                  <div class="faq-item">
                    <h5>How do I download apps?</h5>
                    <p>Simply browse our catalog, click on any app, and hit the "Install" button on the app details page. The APK file will be downloaded to your device.</p>
                  </div>
                  <div class="faq-item">
                    <h5>Are the apps safe?</h5>
                    <p>We review all apps before they're published on our platform. However, we recommend using antivirus software and only downloading apps from trusted developers.</p>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="faq-item">
                    <h5>How do I become a developer?</h5>
                    <p>Visit our developer dashboard and sign up for a developer account. You can then submit your apps for review and publication on our platform.</p>
                  </div>
                  <div class="faq-item">
                    <h5>Can I request specific apps?</h5>
                    <p>Yes! Send us a message with your app request, and we'll reach out to developers or consider it for our development roadmap.</p>
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
    .contact-container {
      min-height: 100vh;
      background-color: #f8f9fa;
      padding-top: 80px; // Account for fixed header height
    }

    .contact-info {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: fit-content;

      .contact-title {
        color: #212529;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .contact-subtitle {
        color: #6c757d;
        font-size: 1.1rem;
        margin-bottom: 32px;
        line-height: 1.6;
      }

      .contact-methods {
        margin-bottom: 32px;

        .contact-method {
          display: flex;
          align-items: flex-start;
          margin-bottom: 24px;

          .method-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(45deg, #007bff, #6610f2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            margin-right: 16px;
            flex-shrink: 0;
          }

          .method-content {
            h5 {
              color: #212529;
              font-weight: 600;
              margin-bottom: 4px;
            }

            p {
              color: #495057;
              margin-bottom: 4px;
            }

            small {
              color: #6c757d;
            }
          }
        }
      }

      .social-links {
        h5 {
          color: #212529;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .social-icons {
          display: flex;
          gap: 12px;

          .social-icon {
            width: 40px;
            height: 40px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;

            &:hover {
              background: #007bff;
              color: white;
              transform: translateY(-2px);
            }
          }
        }
      }
    }

    .contact-form-container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .contact-form {
        .form-label {
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
        }

        .form-control, .form-select {
          border-color: #dee2e6;
          border-radius: 8px;
          padding: 12px 16px;

          &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          &.is-invalid {
            border-color: #dc3545;
            
            &:focus {
              border-color: #dc3545;
              box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
          }

          &.is-valid {
            border-color: #198754;
          }
        }

        .invalid-feedback {
          display: block;
          margin-top: 4px;
          
          small {
            color: #dc3545;
            font-size: 0.875rem;
          }
        }

        .form-text {
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 4px;
        }

        .form-check-label {
          color: #495057;
          
          a {
            color: #007bff;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .form-actions {
        margin-top: 24px;
        text-align: center;

        .btn {
          min-width: 160px;
        }
      }
    }

    .faq-section {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h2 {
        color: #212529;
        font-weight: 700;
      }

      .faq-item {
        margin-bottom: 24px;

        h5 {
          color: #495057;
          font-weight: 600;
          margin-bottom: 8px;
        }

        p {
          color: #6c757d;
          line-height: 1.6;
        }
      }
    }

    @media (max-width: 768px) {
      .contact-info,
      .contact-form-container,
      .faq-section {
        padding: 24px 20px;
      }

      .contact-info {
        margin-bottom: 24px;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  formData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    agreeToPrivacy: false
  };

  submitting = false;

  private db = getFirestore(firebaseApp);

  constructor(
    private toastService: ToastService,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {}

  navigateToComingSoon(platform: string) {
    this.router.navigate(['/coming-soon']);
  }

  async submitForm() {
    if (this.submitting) return;

    // Validate form before submission
    if (!this.isFormValid()) {
      this.toastService.warning('Form Validation', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      this.submitting = true;

      // Save contact form submission to Firestore
      const contactCollection = collection(this.db, 'contact_submissions');
      await addDoc(contactCollection, {
        ...this.formData,
        createdAt: new Date(),
        status: 'new',
        submittedFrom: 'website'
      });

      // Send email notification using Azure Communication Services
      const emailSent = await this.emailService.sendContactEmail({
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone,
        company: this.formData.company,
        subject: this.formData.subject,
        message: this.formData.message
      });

      // Send auto-reply to user
      if (emailSent) {
        await this.emailService.sendAutoReplyEmail({
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          company: this.formData.company,
          subject: this.formData.subject,
          message: this.formData.message
        });
      }

      // Show success message
      this.toastService.success(
        'Message Sent Successfully!', 
        emailSent 
          ? 'Thank you for your message! We\'ll get back to you within 24 hours. You should also receive a confirmation email shortly.'
          : 'Your message has been saved. We\'ll get back to you within 24 hours.'
      );
      
      // Reset form
      this.resetForm();

    } catch (error) {
      console.error('Error submitting contact form:', error);
      this.toastService.error(
        'Error Sending Message', 
        'Sorry, there was an error sending your message. Please try again or email us directly at contact@example.com'
      );
    } finally {
      this.submitting = false;
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.formData.name?.trim() && 
      this.formData.name.length >= 2 &&
      this.formData.email?.trim() && 
      this.isValidEmail(this.formData.email) &&
      this.formData.subject?.trim() &&
      this.formData.message?.trim() && 
      this.formData.message.length >= 10 &&
      this.formData.message.length <= 1000 &&
      this.formData.agreeToPrivacy
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      agreeToPrivacy: false
    };
  }
}
