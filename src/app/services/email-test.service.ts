import { Injectable } from '@angular/core';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root'
})
export class EmailTestService {
  
  constructor(private emailService: EmailService) {}

  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        subject: 'test',
        message: 'This is a test message to verify email configuration.'
      };

      console.log('Testing email configuration...');
      
      // Test sending email (this will actually send an email if configured correctly)
      const result = await this.emailService.sendContactEmail(testData);
      
      if (result) {
        return {
          success: true,
          message: 'Email configuration test successful! Check the recipient inbox.'
        };
      } else {
        return {
          success: false,
          message: 'Email configuration test failed. Check console for errors.'
        };
      }
    } catch (error) {
      console.error('Email test error:', error);
      return {
        success: false,
        message: `Email test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  validateConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // This would need to be imported from the config
    // For now, just check if the EmailService can be instantiated
    try {
      // Basic validation - in a real scenario, you'd check the actual config values
      if (!this.emailService) {
        issues.push('Email service not available');
      }
    } catch (error) {
      issues.push('Failed to initialize email service');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

// Usage example:
// In a component or service, inject EmailTestService and call:
// const result = await this.emailTestService.testEmailConfiguration();
// console.log(result.message);
