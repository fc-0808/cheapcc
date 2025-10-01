import { Resend } from 'resend';
import React from 'react';
import { getTemplateById, validateTemplateProps, EmailTemplate, EmailTemplateProps } from './registry';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export interface SendEmailOptions {
  templateId: string;
  to: string;
  props: EmailTemplateProps;
  from?: string;
  subject?: string; // Override template default subject
}

export interface SendEmailResult {
  success: boolean;
  data?: any;
  error?: {
    name: string;
    message: string;
  };
}

// Add delay function for rate limiting
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add retry logic for rate limiting
async function sendEmailWithRetry(emailData: any, maxRetries: number = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData);
      
      if (result.error) {
        // Check if it's a rate limit error
        if (result.error.name === 'rate_limit_exceeded' && attempt < maxRetries) {
          console.warn(`Rate limit hit on attempt ${attempt}, retrying in ${attempt * 2} seconds...`);
          await delay(attempt * 2000); // Exponential backoff: 2s, 4s, 6s
          continue;
        }
        return result;
      }
      
      return result;
    } catch (error: any) {
      if (attempt < maxRetries) {
        console.warn(`Email send failed on attempt ${attempt}, retrying in ${attempt * 2} seconds...`);
        await delay(attempt * 2000);
        continue;
      }
      throw error;
    }
  }
}

export async function sendTemplateEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return {
      success: false,
      error: { name: "ConfigurationError", message: "Resend API key not configured." }
    };
  }

  try {
    // Get template
    const template = getTemplateById(options.templateId);
    if (!template) {
      return {
        success: false,
        error: { name: "TemplateNotFound", message: `Template with ID "${options.templateId}" not found.` }
      };
    }

    // Validate props
    const validation = validateTemplateProps(template, options.props);
    if (!validation.valid) {
      return {
        success: false,
        error: { 
          name: "ValidationError", 
          message: `Missing required props: ${validation.missing.join(', ')}` 
        }
      };
    }

    // Prepare email data
    const emailData = {
      from: options.from || 'CheapCC Support <support@cheapcc.online>',
      to: options.to,
      subject: options.subject || template.subject,
      react: React.createElement(template.component, options.props),
    };

    // Send email with retry logic
    const result = await sendEmailWithRetry(emailData);

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: {
          name: result.error.name,
          message: result.error.message
        }
      };
    }

    console.info(`Email sent successfully using template "${template.name}" to ${options.to}`);
    return {
      success: true,
      data: result.data
    };

  } catch (error: any) {
    console.error('Failed to send template email:', error);
    return {
      success: false,
      error: {
        name: error.name || "UnhandledException",
        message: error.message
      }
    };
  }
}

// Batch send emails using a template
export async function sendBatchTemplateEmails(
  templateId: string,
  recipients: Array<{ email: string; props: EmailTemplateProps }>,
  options?: { from?: string; subject?: string; delayMs?: number }
): Promise<{
  total: number;
  sent: number;
  errors: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let errors = 0;

  // Ensure minimum delay to respect rate limits (Resend allows 2 requests per second)
  const minDelayMs = 600; // 600ms = slightly more than 500ms (2 per second)
  const actualDelayMs = Math.max(options?.delayMs || 0, minDelayMs);

  console.log(`Starting batch email send to ${recipients.length} recipients with ${actualDelayMs}ms delay between sends`);

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      console.log(`Sending email ${i + 1}/${recipients.length} to ${recipient.email}...`);
      
      const result = await sendTemplateEmail({
        templateId,
        to: recipient.email,
        props: recipient.props,
        from: options?.from,
        subject: options?.subject
      });

      if (result.success) {
        sent++;
        results.push({ email: recipient.email, success: true });
        console.log(`✅ Email ${i + 1}/${recipients.length} sent successfully to ${recipient.email}`);
      } else {
        errors++;
        results.push({ 
          email: recipient.email, 
          success: false, 
          error: result.error?.message 
        });
        console.error(`❌ Email ${i + 1}/${recipients.length} failed for ${recipient.email}: ${result.error?.message}`);
      }

      // Add delay between emails to respect rate limits (except for the last email)
      if (i < recipients.length - 1) {
        console.log(`Waiting ${actualDelayMs}ms before next email...`);
        await delay(actualDelayMs);
      }

    } catch (error: any) {
      errors++;
      results.push({ 
        email: recipient.email, 
        success: false, 
        error: error.message 
      });
      console.error(`❌ Email ${i + 1}/${recipients.length} exception for ${recipient.email}: ${error.message}`);
      
      // Still add delay even on error to maintain rate limiting
      if (i < recipients.length - 1) {
        await delay(actualDelayMs);
      }
    }
  }

  console.log(`Batch email send completed: ${sent} sent, ${errors} errors out of ${recipients.length} total`);

  return {
    total: recipients.length,
    sent,
    errors,
    results
  };
}

// Preview template (for testing/preview purposes)
export function previewTemplate(templateId: string, props?: EmailTemplateProps) {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template with ID "${templateId}" not found.`);
  }

  const previewProps = { ...template.previewProps, ...props };
  const validation = validateTemplateProps(template, previewProps);
  
  if (!validation.valid) {
    throw new Error(`Missing required props for preview: ${validation.missing.join(', ')}`);
  }

  return {
    template,
    props: previewProps,
    component: React.createElement(template.component, previewProps)
  };
}
