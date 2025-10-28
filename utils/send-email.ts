import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';
import { EmailActivationEmailTemplate } from '@/components/SelfActivationEmailTemplate';
import { RedemptionCodeEmailTemplate } from '@/components/RedemptionCodeEmailTemplate';
import { WelcomeEmailTemplate } from '@/components/WelcomeEmailTemplate';
import { CustomerOwnedEmailAnnouncementTemplate } from '@/components/CustomerOwnedEmailAnnouncementTemplate';
import { getPricingOptions, isRedemptionCode } from '@/utils/products-supabase';
import React from 'react';

const resendApiKey = process.env.RESEND_API_KEY;
const resendAudienceId = process.env.RESEND_AUDIENCE_ID;

if (!resendApiKey) {
  console.error(JSON.stringify({
    message: "RESEND_API_KEY is not defined. Email functionality will be disabled.",
    source: "send-email.ts static initialization"
  }, null, 2));
}
const resend = new Resend(resendApiKey);

export async function sendConfirmationEmail(
  to: string, 
  name: string, 
  orderId: string, 
  isGuest: boolean = false, 
  activationType?: string,
  adobeEmail?: string,
  priceId?: string,
  amount?: number | string,
  currency?: string,
  countryCode?: string,
  descriptionFromSource?: string
) {
  if (!resendApiKey) {
    console.error(JSON.stringify({
      message: "Cannot send confirmation email: RESEND_API_KEY is not configured.",
      to, orderId, name, isGuest, activationType, adobeEmail,
      source: "sendConfirmationEmail"
    }, null, 2));
    // Optionally, you might want to throw an error or return a specific status
    // For now, just returning a mock error structure similar to Resend's
    return { data: null, error: { name: "ConfigurationError", message: "Resend API key not configured." } };
  }

  try {
    const normalizeAmount = (value: number | string | undefined): number | undefined => {
      if (value === undefined) return undefined;
      if (typeof value === 'number') return value;
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const formatCurrency = (
      value?: number,
      currencyCode?: string,
      localeHint?: string
    ): string | undefined => {
      if (value === undefined || !currencyCode) return undefined;
      try {
        const locale = localeHint && localeHint.length === 2 ? `${localeHint}-${localeHint}` : undefined;
        return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency: currencyCode }).format(value);
      } catch {
        return `${value.toFixed(2)} ${currencyCode}`;
      }
    };

    // Determine the product type and choose appropriate template
    let templateComponent = EmailTemplate;
    let templateProps: any = { name, orderId, isGuest };
    let emailSubject = 'Your CheapCC Order Confirmation';

    // Get pricing options dynamically
    const pricingOptions = await getPricingOptions();
    const selectedPriceOption = priceId ? pricingOptions.find(p => p.id === priceId) : null;
    const isRedemptionCodeProduct = selectedPriceOption ? isRedemptionCode(selectedPriceOption) : false;

    const normalizedAmount = normalizeAmount(amount);
    const priceDisplay = formatCurrency(normalizedAmount, currency, countryCode);
    const planDescription = descriptionFromSource || selectedPriceOption?.description;
    const duration = selectedPriceOption?.duration;
    const productName = selectedPriceOption?.originalName?.includes('Acrobat') ? 'Adobe Acrobat Pro' : 'Adobe Creative Cloud';

    if (isRedemptionCodeProduct) {
      // Use redemption code template
      templateComponent = RedemptionCodeEmailTemplate;
      templateProps = { 
        name, 
        orderId, 
        isGuest,
        productName,
        duration: duration || '6 months',
        priceDisplay,
      };
      emailSubject = 'Your CheapCC Redemption Code Order Confirmation';
    } else if (activationType === 'email-activation') {
      // Use email-activation template for regular products with email-activation
      templateComponent = EmailActivationEmailTemplate;
      templateProps = { name, orderId, isGuest, adobeEmail, priceDisplay, planDescription, duration };
    }
    // Default case uses EmailTemplate with basic props (already set above)

    // Always enrich the default/basic template with plan + price when available
    if (templateComponent === EmailTemplate) {
      templateProps = { 
        ...templateProps,
        planDescription,
        priceDisplay,
        duration,
        productName,
      };
    }

    const emailData = {
      from: 'CheapCC Support <support@cheapcc.online>', // Ensure this email is verified with Resend
      to,
      subject: emailSubject,
      react: React.createElement(templateComponent, templateProps),
    };

    const result = await resend.emails.send(emailData);

    if (result.error) {
        console.error(JSON.stringify({
            message: "Resend API returned an error for confirmation email.",
            to, orderId, name, isGuest, activationType, adobeEmail,
            resendErrorName: result.error.name,
            resendErrorMessage: result.error.message,
            // resendErrorObject: result.error, // Could be verbose
            source: "sendConfirmationEmail",
        }, null, 2));
        return result; // Propagate Resend's error structure
    }

    console.info(JSON.stringify({
        message: "Confirmation email sent successfully via Resend.",
        to, orderId, name, isGuest, activationType, adobeEmail,
        resendId: result.data?.id,
        source: "sendConfirmationEmail",
    }, null, 2));
    return result;

  } catch (error: any) {
    console.error(JSON.stringify({
        message: "Failed to send confirmation email due to an unexpected error.",
        to, orderId, name, isGuest, activationType, adobeEmail,
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
export async function addUserToMarketingAudience(email: string, name: string) {
  if (!resendApiKey || !resendAudienceId) {
    console.warn(JSON.stringify({
      message: "Cannot add user to marketing audience: Resend API Key or Audience ID not configured.",
      email,
      source: "addUserToMarketingAudience"
    }, null, 2));
    return { success: false, error: "Missing API key or audience ID" };
  }

  try {
    // Split the name into first name and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const result = await resend.contacts.create({
      email,
      firstName,
      lastName,
      unsubscribed: false,
      audienceId: resendAudienceId,
    });

    if (result.error) {
      console.error(JSON.stringify({
        message: "Resend API returned an error adding contact to audience.",
        email,
        name,
        resendErrorName: result.error.name,
        resendErrorMessage: result.error.message,
        source: "addUserToMarketingAudience",
      }, null, 2));
      return { success: false, error: result.error.message };
    }

    console.info(JSON.stringify({
      message: "Successfully added contact to marketing audience.",
      email,
      name,
      contact_id: result.data?.id,
      source: "addUserToMarketingAudience",
    }, null, 2));
    return { success: true };

  } catch (error: any) {
    console.error(JSON.stringify({
      message: "Failed to add contact to marketing audience due to an unexpected error.",
      email,
      name,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      source: "addUserToMarketingAudience (catch block)",
    }, null, 2));
    return { success: false, error: error.message };
  }
}

export async function updateUserMarketingPreference(email: string, name: string, isSubscribed: boolean) {
  if (!resendApiKey || !resendAudienceId) {
    console.warn(JSON.stringify({
      message: "Cannot update marketing preference: Resend API Key or Audience ID not configured.",
      email, isSubscribed,
      source: "updateUserMarketingPreference"
    }, null, 2));
    return { success: false, error: "Missing API key or audience ID" };
  }

  try {
    const { data: existingContact, error: getError } = await resend.contacts.get({
      audienceId: resendAudienceId,
      email: email,
    });

    if (getError && getError.name !== 'not_found') {
      // An error other than "not found" occurred
      throw getError;
    }

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (existingContact) {
      // Contact exists, update them
      const { data, error } = await resend.contacts.update({
        id: existingContact.id,
        audienceId: resendAudienceId,
        unsubscribed: !isSubscribed, // resend uses 'unsubscribed' flag
        firstName,
        lastName,
      });

      if (error) throw error;
      
      console.info(JSON.stringify({
        message: "Successfully updated contact's marketing preference.",
        email, isSubscribed, contact_id: data?.id,
        source: "updateUserMarketingPreference (update)",
      }, null, 2));
      return { success: true };

    } else if (isSubscribed) {
      // Contact does not exist and user wants to subscribe, so create them
      const { data, error } = await resend.contacts.create({
        email,
        firstName,
        lastName,
        unsubscribed: false,
        audienceId: resendAudienceId,
      });

      if (error) throw error;

      console.info(JSON.stringify({
        message: "Successfully created contact and set marketing preference.",
        email, isSubscribed, contact_id: data?.id,
        source: "updateUserMarketingPreference (create)",
      }, null, 2));
      return { success: true };

    } else {
      // Contact does not exist and user wants to unsubscribe, do nothing.
      console.info(JSON.stringify({
        message: "User wants to unsubscribe but was not found in marketing audience. No action taken.",
        email, isSubscribed,
        source: "updateUserMarketingPreference (no-op)",
      }, null, 2));
      return { success: true };
    }

  } catch (error: any) {
    console.error(JSON.stringify({
      message: "Failed to update marketing preference due to an unexpected error.",
      email, isSubscribed,
      errorMessage: error.message,
      errorName: error.name,
      source: "updateUserMarketingPreference (catch block)",
    }, null, 2));
    return { success: false, error: error.message };
  }
}

export async function sendCustomerOwnedEmailAnnouncement(to: string, name: string) {
  if (!resendApiKey) {
    console.error(JSON.stringify({
      message: "Cannot send customer announcement email: RESEND_API_KEY is not configured.",
      to, name,
      source: "sendCustomerOwnedEmailAnnouncement"
    }, null, 2));
    return { data: null, error: { name: "ConfigurationError", message: "Resend API key not configured." } };
  }

  try {
    const emailData = {
      from: 'CheapCC Support <support@cheapcc.online>',
      to,
      subject: '🎉 New Feature: Use Your Own Adobe Account with CheapCC',
      react: React.createElement(CustomerOwnedEmailAnnouncementTemplate, { name }),
    };

    const result = await resend.emails.send(emailData);

    if (result.error) {
        console.error(JSON.stringify({
            message: "Resend API returned an error for customer announcement email.",
            to, name,
            resendErrorName: result.error.name,
            resendErrorMessage: result.error.message,
            source: "sendCustomerOwnedEmailAnnouncement",
        }, null, 2));
        return result;
    }

    console.info(JSON.stringify({
        message: "Customer announcement email sent successfully via Resend.",
        to, name,
        resendId: result.data?.id,
        source: "sendCustomerOwnedEmailAnnouncement",
    }, null, 2));
    return result;

  } catch (error: any) {
    console.error(JSON.stringify({
        message: "Failed to send customer announcement email due to an unexpected error.",
        to, name,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        source: "sendCustomerOwnedEmailAnnouncement (catch block)",
    }, null, 2));
    return { data: null, error: { name: error.name || "UnhandledException", message: error.message } };
  }
}