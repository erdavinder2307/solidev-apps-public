# Azure Communication Services Email Setup

This document provides instructions for setting up Azure Communication Services to enable email functionality in the contact form.

## Prerequisites

1. An Azure subscription
2. An Azure Communication Services resource
3. A verified domain (or use the free Azure subdomain for testing)

## Setup Instructions

### 1. Create Azure Communication Services Resource

1. Go to the [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Communication Services"
4. Click "Create" and fill in the required details:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing
   - **Resource name**: Choose a unique name
   - **Data location**: Choose your preferred location
5. Click "Review + create" and then "Create"

### 2. Create Email Communication Service

1. In the Azure portal, go to your Communication Services resource
2. In the left menu, click on "Email" under "Services"
3. Click "Get started"
4. Click "Create Email Communication Service"
5. Fill in the required details:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Same as your Communication Services resource
   - **Resource name**: Choose a unique name for email service
   - **Region**: Choose your preferred region
6. Click "Review + create" and then "Create"

### 3. Connect Email Service to Communication Services

1. Go to your Communication Services resource
2. In the left menu, click on "Email" under "Services"
3. Click "Connect domain"
4. Select your Email Communication Service
5. Click "Connect"

### 4. Set Up Domain

#### Option A: Use Free Azure Subdomain (for testing)
1. In your Email Communication Service, click "Provision domains"
2. Select "Azure subdomain"
3. Click "Add" - this gives you a domain like `xxxx.azurecomm.net`

#### Option B: Use Custom Domain (for production)
1. In your Email Communication Service, click "Provision domains"
2. Select "Custom domain"
3. Enter your domain name
4. Follow the verification steps by adding DNS records
5. Wait for verification to complete

### 5. Get Connection String

1. Go to your Communication Services resource
2. In the left menu, click on "Keys" under "Settings"
3. Copy the "Connection string" (either Primary or Secondary)

### 6. Configure Sender Email

1. Go to your Email Communication Service
2. Click on your domain
3. Note the "MailFrom" address that you can use as sender
4. If using custom domain, you can create additional sender addresses

### 7. Update Configuration

Update the configuration file at `src/app/config/azure-email.config.ts`:

```typescript
export const azureEmailConfig = {
  // Paste your connection string here
  connectionString: 'endpoint=https://your-resource.communication.azure.com/;accesskey=your-access-key',
  
  // Use the MailFrom address from your domain setup
  senderEmail: 'donotreply@xxxx.azurecomm.net', // or your custom domain email
  
  // Where contact form submissions should be sent
  recipientEmail: 'contact@example.com',
  
  senderDisplayName: 'Solidev ElectroSoft',
  recipientDisplayName: 'Solidev ElectroSoft Admin'
};
```

## Testing

1. Build and run your Angular application
2. Navigate to the contact page
3. Fill out and submit the contact form
4. Check your email for both the notification and auto-reply

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check your connection string is correct
2. **"Sender not verified" errors**: Ensure the sender email is from your verified domain
3. **Emails not received**: Check spam folder and verify recipient email address
4. **Domain verification fails**: Ensure DNS records are correctly added and propagated

### Rate Limits

Azure Communication Services has rate limits:
- Free tier: 100 emails per month
- Standard tier: Higher limits based on your plan

### Monitoring

You can monitor email sending in the Azure portal:
1. Go to your Communication Services resource
2. Check "Metrics" and "Logs" for email sending statistics

## Security Considerations

1. **Never commit credentials**: Keep your connection string secure and never commit it to version control
2. **Use environment variables**: In production, store the connection string in environment variables or Azure Key Vault
3. **Implement rate limiting**: Add rate limiting to prevent abuse of the contact form
4. **Validate inputs**: Always validate and sanitize user inputs before sending emails

## Cost Optimization

1. Use the free tier for development and testing
2. Monitor usage in Azure portal
3. Implement email batching if sending multiple emails
4. Consider using Azure Logic Apps for complex email workflows

## Support

For issues with Azure Communication Services:
- [Azure Communication Services Documentation](https://docs.microsoft.com/en-us/azure/communication-services/)
- [Azure Support](https://azure.microsoft.com/en-us/support/)
