// Environment-based configuration for Azure Communication Services
// This file demonstrates how to use environment variables for better security

export const azureEmailConfig = {
  // For development, you can use environment variables
  // For production, ensure these are set in your deployment environment
  connectionString: typeof window !== 'undefined' 
    ? (window as any)['azureEmailConnectionString'] || ''
    : process.env['AZURE_COMMUNICATION_CONNECTION_STRING'] || '',
  
  senderEmail: typeof window !== 'undefined'
    ? (window as any)['azureEmailSender'] || 'noreply@example.com'
    : process.env['SENDER_EMAIL'] || 'noreply@example.com',
  
  recipientEmail: typeof window !== 'undefined'
    ? (window as any)['azureEmailRecipient'] || 'contact@example.com'
    : process.env['RECIPIENT_EMAIL'] || 'contact@example.com',
    
  senderDisplayName: process.env['SENDER_DISPLAY_NAME'] || 'Support Team',
  recipientDisplayName: process.env['RECIPIENT_DISPLAY_NAME'] || 'Support Team'
};

// For browser environment, you can set these in index.html:
// <script>
//   window.azureEmailConnectionString = 'your-connection-string-here';
//   window.azureEmailSender = 'your-sender-email-here';
//   window.azureEmailRecipient = 'your-recipient-email-here';
// </script>

// For server-side rendering, set environment variables:
// AZURE_COMMUNICATION_CONNECTION_STRING=your-connection-string-here
// SENDER_EMAIL=your-sender-email-here
// RECIPIENT_EMAIL=your-recipient-email-here
