import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';
import { WelcomeEmailTemplate } from '@/components/WelcomeEmailTemplate';
import React from 'react';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error(JSON.stringify({
    message: "RESEND_API_KEY is not defined. Email functionality will be disabled.",
    source: "send-email.ts static initialization"
  }, null, 2));
}
const resend = new Resend(resendApiKey);

export async function sendConfirmationEmail(to: string, name: string, orderId: string, isGuest: boolean = false) {
  if (!resendApiKey) {
    console.error(JSON.stringify({
      message: "Cannot send confirmation email: RESEND_API_KEY is not configured.",
      to, orderId, name, isGuest,
      source: "sendConfirmationEmail"
    }, null, 2));
    // Optionally, you might want to throw an error or return a specific status
    // For now, just returning a mock error structure similar to Resend's
    return { data: null, error: { name: "ConfigurationError", message: "Resend API key not configured." } };
  }

  try {
    const emailData = {
      from: 'CheapCC Support <support@cheapcc.online>', // Ensure this email is verified with Resend
      to,
      subject: 'Your CheapCC Order Confirmation',
      react: React.createElement(EmailTemplate, { name, orderId, isGuest }),
    };

    const result = await resend.emails.send(emailData);

    if (result.error) {
        console.error(JSON.stringify({
            message: "Resend API returned an error for confirmation email.",
            to, orderId, name, isGuest,
            resendErrorName: result.error.name,
            resendErrorMessage: result.error.message,
            // resendErrorObject: result.error, // Could be verbose
            source: "sendConfirmationEmail",
        }, null, 2));
        return result; // Propagate Resend's error structure
    }

    console.info(JSON.stringify({
        message: "Confirmation email sent successfully via Resend.",
        to, orderId, name, isGuest,
        resendId: result.data?.id,
        source: "sendConfirmationEmail",
    }, null, 2));
    return result;

  } catch (error: any) {
    console.error(JSON.stringify({
        message: "Failed to send confirmation email due to an unexpected error.",
        to, orderId, name, isGuest,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        source: "sendConfirmationEmail (catch block)",
    }, null, 2));
    // Mimic Resend error structure for consistency if needed by calling code
    return { data: null, error: { name: error.name || "UnhandledException", message: error.message } };
    // Or re-throw: throw error;
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resendApiKey) {
    console.error(JSON.stringify({
      message: "Cannot send welcome email: RESEND_API_KEY is not configured.",
      to, name,
      source: "sendWelcomeEmail"
    }, null, 2));
    return { data: null, error: { name: "ConfigurationError", message: "Resend API key not configured." } };
  }

  try {
    const emailData = {
      from: 'CheapCC Support <support@cheapcc.online>',
      to,
      subject: 'Welcome to CheapCC - Your Account is Ready!',
      react: React.createElement(WelcomeEmailTemplate, { name }),
    };

    const result = await resend.emails.send(emailData);

    if (result.error) {
        console.error(JSON.stringify({
            message: "Resend API returned an error for welcome email.",
            to, name,
            resendErrorName: result.error.name,
            resendErrorMessage: result.error.message,
            source: "sendWelcomeEmail",
        }, null, 2));
        return result;
    }

    console.info(JSON.stringify({
        message: "Welcome email sent successfully via Resend.",
        to, name,
        resendId: result.data?.id,
        source: "sendWelcomeEmail",
    }, null, 2));
    return result;

  } catch (error: any) {
    console.error(JSON.stringify({
        message: "Failed to send welcome email due to an unexpected error.",
        to, name,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        source: "sendWelcomeEmail (catch block)",
    }, null, 2));
    return { data: null, error: { name: error.name || "UnhandledException", message: error.message } };
  }
} 