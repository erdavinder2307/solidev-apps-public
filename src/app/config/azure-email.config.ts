// Azure Communication Services Configuration
// DO NOT commit actual credentials to version control
// Set these values in your .env file

export const azureEmailConfig = {
  // Your Azure Communication Services connection string
  // Format: endpoint=https://your-resource.communication.azure.com/;accesskey=your-access-key
  connectionString: process.env['AZURE_COMMUNICATION_CONNECTION_STRING'] || '',
  
  // Sender email address (must be verified in Azure Communication Services)
  senderEmail: process.env['SENDER_EMAIL'] || 'noreply@example.com',
  
  // Recipient email address for contact form submissions
  recipientEmail: process.env['RECIPIENT_EMAIL'] || 'contact@example.com',
  
  // Optional: Display name for the sender
  senderDisplayName: process.env['SENDER_DISPLAY_NAME'] || 'Your Application',
  
  // Optional: Display name for the recipient
  recipientDisplayName: process.env['RECIPIENT_DISPLAY_NAME'] || 'Support Team'
};

// Validate configuration
if (!azureEmailConfig.connectionString || azureEmailConfig.connectionString === '') {
  console.warn('Azure Communication Services is not configured.');
  console.warn('Email functionality will not work until credentials are provided.');
  console.warn('See .env.example and docs/AZURE_EMAIL_SETUP.md for setup instructions.');
}

// Instructions for setup:
// 1. Create an Azure Communication Services resource in Azure portal
// 2. Add an Email Communication Service and connect it to your Communication Services resource
// 3. Add and verify your domain (or use the free Azure subdomain for testing)
// 4. Copy the connection string from the Keys section
// 5. Set AZURE_COMMUNICATION_CONNECTION_STRING in your .env file
// 6. Set sender and recipient emails in .env file
// 
// See docs/AZURE_EMAIL_SETUP.md for detailed instructions
