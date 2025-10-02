# Welcome Email Setup Guide

This guide will help you set up automated welcome emails for new user signups in your CLARA Health Diagnostics application.

## Overview

The welcome email system supports multiple email providers:
- **EmailJS** (Recommended for quick setup)
- **Firebase Extensions** (Best for production)
- **Custom Email Service** (For advanced users)

## Quick Setup with EmailJS (Recommended)

EmailJS is the easiest way to get welcome emails working quickly without a backend.

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Configure EmailJS Service
1. In your EmailJS dashboard, click "Add New Service"
2. Choose your email provider (Gmail, Outlook, etc.)
3. Follow the setup instructions to connect your email account
4. Note down your **Service ID**

### Step 3: Create Email Template
1. In EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Use this template configuration:

```
Template Name: welcome_email
Subject: Welcome to {{app_name}}!

Template Content:
{{html_content}}

Template Variables:
- to_email: {{to_email}}
- to_name: {{to_name}}
- subject: {{subject}}
- html_content: {{html_content}}
- text_content: {{text_content}}
```

4. Note down your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" > "General"
2. Copy your **Public Key**

### Step 5: Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Update these values:

```env
VITE_EMAIL_PROVIDER=emailjs
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 6: Install EmailJS Package
```bash
npm install @emailjs/browser
```

### Step 7: Test the Setup
1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check your email for the welcome message
4. Check browser console for any errors

## Advanced Setup with Firebase Extensions

For production applications, Firebase Extensions provide a more robust solution.

### Step 1: Install Trigger Email Extension
```bash
firebase ext:install firebase/firestore-send-email --project=your-project-id
```

### Step 2: Configure Extension
1. Follow the extension setup wizard
2. Configure your email service (SendGrid, Mailgun, etc.)
3. Set the collection path to `mail`

### Step 3: Update Environment
```env
VITE_EMAIL_PROVIDER=firebase
```

### Step 4: Modify Email Service
The current email service will automatically use Firebase when configured.

## Custom Email Service Setup

For advanced users who want to use their own email service:

### Step 1: Set Up Your Email API
Create an endpoint that accepts POST requests with this format:
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "html": "<html>...</html>",
  "text": "Welcome text..."
}
```

### Step 2: Configure Environment
```env
VITE_EMAIL_PROVIDER=custom
VITE_EMAIL_API_URL=https://your-api.com/send-email
VITE_EMAIL_API_KEY=your_api_key
```

### Step 3: Implement Custom Provider
Modify the `sendViaCustomProvider` method in `services/emailService.ts`.

## Features

### User Profile Integration
- Welcome emails are personalized with user's name
- User profiles are automatically created in Firestore
- Supports additional signup data collection

### Email Templates
- Professional HTML template with responsive design
- Plain text fallback for email clients that don't support HTML
- Customizable branding and content

### Error Handling
- Email failures don't block user signup
- Graceful fallbacks and error logging
- Development mode shows email content in console

## Components

### Enhanced Signup Form
Use the new `EnhancedSignUp` component for better user experience:

```tsx
import { EnhancedSignUp } from './components/auth/EnhancedSignUp';

// Replace the old SignUp component with EnhancedSignUp
<EnhancedSignUp onToggleView={handleToggleView} />
```

Features:
- Multi-step signup process
- Collects user's first/last name
- Email notification preferences
- Better validation and error handling

## Testing

### Development Mode
When no email provider is configured, emails are logged to the browser console for testing.

### Email Preview
You can preview email templates by calling:
```typescript
import { emailService } from './services/emailService';

// Generate preview
const template = emailService.generateWelcomeEmailTemplate({
  user: { id: 'test', email: 'test@example.com' },
  firstName: 'John',
  lastName: 'Doe'
});

console.log(template.html);
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check environment variables are set correctly
   - Verify email service credentials
   - Check browser console for errors

2. **EmailJS errors**
   - Ensure public key is correct
   - Check service and template IDs
   - Verify email service is properly connected

3. **Firebase extension issues**
   - Check extension logs in Firebase console
   - Verify Firestore security rules allow writes to `mail` collection
   - Ensure extension is properly configured

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG_EMAIL=true
```

## Security Considerations

- Never expose private keys in client-side code
- Use environment variables for all sensitive configuration
- Implement rate limiting for signup endpoints
- Validate email addresses on both client and server
- Consider implementing email verification flow

## Customization

### Email Template
Modify the template in `services/emailService.ts`:
- Update HTML styling
- Change email content
- Add more personalization fields

### User Profile Fields
Extend `UserProfile` interface in `services/userProfileService.ts` to collect more user data.

### Signup Flow
Customize the `EnhancedSignUp` component to add more steps or fields.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test with a simple email service first (EmailJS)
4. Review the email service provider's documentation

For more help, check the documentation of your chosen email provider or create an issue in the project repository.