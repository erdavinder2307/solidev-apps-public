import { Injectable } from '@angular/core';
import { EmailClient } from '@azure/communication-email';
import { azureEmailConfig } from '../config/azure-email.config';

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private emailClient: EmailClient;

  constructor() {
    // Initialize Azure Communication Email client
    this.emailClient = new EmailClient(azureEmailConfig.connectionString);
  }

  async sendContactEmail(contactData: ContactEmailData): Promise<boolean> {
    try {
      // Validate configuration
      if (!azureEmailConfig.connectionString || azureEmailConfig.connectionString === 'YOUR_AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING') {
        console.error('Azure Email: Connection string not configured');
        return false;
      }

      if (!azureEmailConfig.senderEmail || azureEmailConfig.senderEmail === 'your-verified-sender@your-domain.com') {
        console.error('Azure Email: Sender email not configured');
        return false;
      }

      const emailContent = this.generateEmailContent(contactData);
      
      const message = {
        senderAddress: azureEmailConfig.senderEmail,
        content: {
          subject: `Contact Form: ${contactData.subject}`,
          plainText: emailContent.plainText,
          html: emailContent.html,
        },
        recipients: {
          to: [
            {
              address: azureEmailConfig.recipientEmail,
              displayName: azureEmailConfig.recipientDisplayName
            }
          ]
        }
      };

      console.log('Azure Email: Sending contact email...');
      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();
      
      console.log('Azure Email: Contact email sent successfully. Message ID:', result.id);
      return true;
      
    } catch (error) {
      console.error('Azure Email: Error sending contact email:', error);
      
      // Log specific error types for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        if ('code' in error) {
          console.error('Error code:', (error as any).code);
        }
      }
      
      return false;
    }
  }

  async sendAutoReplyEmail(contactData: ContactEmailData): Promise<boolean> {
    try {
      // Validate configuration
      if (!azureEmailConfig.connectionString || azureEmailConfig.connectionString === 'YOUR_AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING') {
        console.error('Azure Email: Connection string not configured for auto-reply');
        return false;
      }

      if (!azureEmailConfig.senderEmail || azureEmailConfig.senderEmail === 'your-verified-sender@your-domain.com') {
        console.error('Azure Email: Sender email not configured for auto-reply');
        return false;
      }

      const autoReplyContent = this.generateAutoReplyContent(contactData);
      
      const message = {
        senderAddress: azureEmailConfig.senderEmail,
        content: {
          subject: 'Thank you for contacting Solidev ElectroSoft',
          plainText: autoReplyContent.plainText,
          html: autoReplyContent.html,
        },
        recipients: {
          to: [
            {
              address: contactData.email,
              displayName: contactData.name
            }
          ]
        }
      };

      console.log('Azure Email: Sending auto-reply to:', contactData.email);
      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();
      
      console.log('Azure Email: Auto-reply sent successfully. Message ID:', result.id);
      return true;
      
    } catch (error) {
      console.error('Azure Email: Error sending auto-reply:', error);
      
      // Log specific error types for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        if ('code' in error) {
          console.error('Error code:', (error as any).code);
        }
      }
      
      return false;
    }
  }

  private generateEmailContent(contactData: ContactEmailData): { plainText: string; html: string } {
    const plainText = `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone || 'Not provided'}
Company: ${contactData.company || 'Not provided'}
Subject: ${contactData.subject}

Message:
${contactData.message}

---
Submitted from: Solidev ElectroSoft Website
Timestamp: ${new Date().toLocaleString()}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(45deg, #007bff, #6610f2); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #495057; }
        .value { margin-top: 5px; }
        .message-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">${contactData.name}</div>
            </div>
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">${contactData.email}</div>
            </div>
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${contactData.phone || 'Not provided'}</div>
            </div>
            <div class="field">
                <div class="label">Company:</div>
                <div class="value">${contactData.company || 'Not provided'}</div>
            </div>
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${contactData.subject}</div>
            </div>
            <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${contactData.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
                Submitted from: Solidev ElectroSoft Website<br>
                Timestamp: ${new Date().toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { plainText, html };
  }

  private generateAutoReplyContent(contactData: ContactEmailData): { plainText: string; html: string } {
    const plainText = `
Dear ${contactData.name},

Thank you for contacting Solidev ElectroSoft! We have received your message regarding "${contactData.subject}" and will get back to you within 24 hours.

Your message:
"${contactData.message}"

If you have any urgent questions, you can reach us directly at ${azureEmailConfig.recipientEmail}.

Best regards,
Solidev ElectroSoft Team

---
This is an automated response. Please do not reply to this email.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank you for contacting us</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(45deg, #007bff, #6610f2); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0; }
        .contact-info { background: white; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
        .logo { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Solidev ElectroSoft</div>
            <p>Thank you for reaching out!</p>
        </div>
        <div class="content">
            <p>Dear <strong>${contactData.name}</strong>,</p>
            
            <p>Thank you for contacting Solidev ElectroSoft! We have received your message regarding "<strong>${contactData.subject}</strong>" and will get back to you within 24 hours.</p>
            
            <div class="message-box">
                <strong>Your message:</strong><br>
                "${contactData.message}"
            </div>
            
            <div class="contact-info">
                <p><strong>Contact Information:</strong></p>
                <p>📧 Email: ${azureEmailConfig.recipientEmail}<br>
                🕒 Business Hours: Monday - Friday: 9:00 AM - 6:00 PM<br>
                📍 Office: Next57 Coworking, Cabin No - 11, C205 Sm Heights Industrial Area Phase 8b Mohali, 140308</p>
            </div>
            
            <p>If you have any urgent questions, you can reach us directly at ${azureEmailConfig.recipientEmail}.</p>
            
            <p>Best regards,<br>
            <strong>Solidev ElectroSoft Team</strong></p>
            
            <div class="footer">
                This is an automated response. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    return { plainText, html };
  }
}
