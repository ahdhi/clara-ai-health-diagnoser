import { User } from '../types';

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

export interface WelcomeEmailData {
    user: User;
    firstName?: string;
    lastName?: string;
}

export interface EmailServiceConfig {
    provider: 'emailjs' | 'firebase' | 'custom';
    serviceId?: string;
    templateId?: string;
    publicKey?: string;
    apiKey?: string;
}

export class EmailService {
    private config: EmailServiceConfig;

    constructor(config: EmailServiceConfig) {
        this.config = config;
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
        try {
            const template = this.generateWelcomeEmailTemplate(data);
            
            switch (this.config.provider) {
                case 'emailjs':
                    return await this.sendViaEmailJS(data, template);
                case 'firebase':
                    return await this.sendViaFirebase(data, template);
                case 'custom':
                    return await this.sendViaCustomProvider(data, template);
                default:
                    console.warn('No email provider configured, logging email instead');
                    this.logEmail(data, template);
                    return true;
            }
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return false;
        }
    }

    /**
     * Generate welcome email template
     */
    private generateWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
        const firstName = data.firstName || data.user.displayName?.split(' ')[0] || 'there';
        const appName = 'CLARA Health Diagnostics';
        
        const subject = `Welcome to ${appName}!`;
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .welcome-message { font-size: 18px; margin-bottom: 30px; }
                .features { background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0; }
                .feature { margin-bottom: 15px; }
                .feature-icon { display: inline-block; width: 20px; margin-right: 10px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
                .footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 ${appName}</h1>
                    <p>AI-Powered Health Diagnostics Platform</p>
                </div>
                
                <div class="content">
                    <div class="welcome-message">
                        <h2>Welcome ${firstName}! 👋</h2>
                        <p>Thank you for joining ${appName}. We're excited to help you on your healthcare journey with our advanced AI-powered diagnostic tools.</p>
                    </div>
                    
                    <div class="features">
                        <h3>What you can do with ${appName}:</h3>
                        <div class="feature">
                            <span class="feature-icon">🔍</span>
                            <strong>AI Diagnostics:</strong> Get intelligent health insights powered by advanced AI
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📊</span>
                            <strong>ICD-10 Database:</strong> Access comprehensive medical coding information
                        </div>
                        <div class="feature">
                            <span class="feature-icon">💊</span>
                            <strong>Drug Interactions:</strong> Check for potential medication interactions
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📈</span>
                            <strong>Health Tracking:</strong> Monitor and track your health data over time
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🩺</span>
                            <strong>Clinical Guidelines:</strong> Access evidence-based medical guidelines
                        </div>
                    </div>
                    
                    <p>Ready to get started? Click the button below to explore your new health diagnostic platform.</p>
                    
                    <a href="${this.getAppUrl()}" class="cta-button">Start Exploring CLARA</a>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <h4>Need Help?</h4>
                        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>© 2025 ${appName}. All rights reserved.</p>
                    <p>This email was sent to ${data.user.email} because you created a new account.</p>
                </div>
            </div>
        </body>
        </html>`;

        const text = `
Welcome to ${appName}, ${firstName}!

Thank you for joining ${appName}. We're excited to help you on your healthcare journey with our advanced AI-powered diagnostic tools.

What you can do with ${appName}:
• AI Diagnostics: Get intelligent health insights powered by advanced AI
• ICD-10 Database: Access comprehensive medical coding information  
• Drug Interactions: Check for potential medication interactions
• Health Tracking: Monitor and track your health data over time
• Clinical Guidelines: Access evidence-based medical guidelines

Ready to get started? Visit: ${this.getAppUrl()}

Need Help?
If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!

© 2025 ${appName}. All rights reserved.
This email was sent to ${data.user.email} because you created a new account.
        `.trim();

        return { subject, html, text };
    }

    /**
     * Send email via EmailJS (easiest to set up)
     */
    private async sendViaEmailJS(data: WelcomeEmailData, template: EmailTemplate): Promise<boolean> {
        try {
            // For now, we'll log emails in development until EmailJS is properly set up
            console.warn('EmailJS not configured. To enable email sending:');
            console.warn('1. Run: npm install @emailjs/browser');
            console.warn('2. Set up EmailJS account and configure environment variables');
            console.warn('3. See docs/WELCOME_EMAIL_SETUP.md for detailed instructions');
            
            // Log the email that would be sent
            this.logEmail(data, template);
            return true; // Return true in development to not block signup
        } catch (error) {
            console.error('EmailJS send failed:', error);
            return false;
        }
    }

    /**
     * Send email via Firebase Functions (requires backend setup)
     */
    private async sendViaFirebase(data: WelcomeEmailData, template: EmailTemplate): Promise<boolean> {
        try {
            // This would typically call a Firebase Cloud Function
            // For now, we'll simulate the call
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: data.user.email,
                    subject: template.subject,
                    html: template.html,
                    text: template.text,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Firebase email send failed:', error);
            return false;
        }
    }

    /**
     * Send email via custom provider
     */
    private async sendViaCustomProvider(data: WelcomeEmailData, template: EmailTemplate): Promise<boolean> {
        // Implement your custom email provider logic here
        console.log('Custom email provider not implemented');
        return false;
    }

    /**
     * Log email to console (for development/testing)
     */
    private logEmail(data: WelcomeEmailData, template: EmailTemplate): void {
        console.log('=== WELCOME EMAIL ===');
        console.log('To:', data.user.email);
        console.log('Subject:', template.subject);
        console.log('HTML Content:', template.html);
        console.log('Text Content:', template.text);
        console.log('===================');
    }

    /**
     * Get application URL
     */
    private getAppUrl(): string {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'https://your-app-domain.com'; // Replace with your actual domain
    }
}

// Factory function to create email service with default configuration
export const createEmailService = (): EmailService => {
    const config: EmailServiceConfig = {
        provider: (import.meta.env.VITE_EMAIL_PROVIDER as EmailServiceConfig['provider']) || 'custom',
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        apiKey: import.meta.env.VITE_EMAIL_API_KEY,
    };

    return new EmailService(config);
};

// Default instance
export const emailService = createEmailService();