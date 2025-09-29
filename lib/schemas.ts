// lib/schemas.ts
import { z } from 'zod';

// --- Auth Schemas ---
export const SignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).max(100, { message: "Name must be 100 characters or less." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }), // Example: Add special character requirement
  confirmPassword: z.string().min(1, { message: "Confirm password is required." }),
  recaptchaToken: z.string().min(1, { message: "reCAPTCHA response is required." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
export type SignupFormData = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  // No reCAPTCHA on login usually, but you could add it if desired:
  // recaptchaToken: z.string().min(1, { message: "reCAPTCHA response is required." }).optional()
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  recaptchaToken: z.string().min(1, { message: "reCAPTCHA response is required." })
});
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const UpdatePasswordSchema = z.object({
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string().min(1, { message: "Confirm new password is required." }),
  // You might not need a recaptchaToken here if the page is accessed via a secure link (password reset token)
  // If it's a form an already authenticated user uses, consider it.
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});
export type UpdatePasswordFormData = z.infer<typeof UpdatePasswordSchema>;


// --- Profile Update Schema ---
export const UpdateProfileSchema = z.object({
    name: z.string().min(1, { message: "Name cannot be empty."}).max(100, { message: "Name is too long."}),
    // email is usually not updatable directly or requires a separate verification flow
});
export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;


// --- PayPal Order Creation Schema (for /api/orders) ---
// Assuming PRICING_OPTIONS is available or you have a way to validate priceId
const VALID_PRICE_IDS = ["14d", "1m", "3m", "6m", "12m", "admin-test"]; // Include test-live and admin-test for admin testing

export const CreateOrderSchema = z.object({
  priceId: z.string().refine(val => VALID_PRICE_IDS.includes(val), { message: "Invalid pricing option selected." }),
  name: z.string().min(1, { message: "Name is required for the order." }).max(100),
  email: z.string().email({ message: "A valid email is required for the order." }),
  activationType: z.enum(['pre-activated', 'self-activation']).optional().default('pre-activated'),
  adobeEmail: z.string().email({ message: "A valid Adobe email is required for self-activation." }).optional(),
});
export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;


// --- PayPal Order Capture Schema (for /api/orders/capture) ---
export const CaptureOrderSchema = z.object({
  orderID: z.string().min(1, { message: "PayPal Order ID is required." }),
});
export type CaptureOrderPayload = z.infer<typeof CaptureOrderSchema>;

// --- Stripe Payment Intent Creation Schema ---
export const CreatePaymentIntentSchema = z.object({
  priceId: z.string().refine(val => VALID_PRICE_IDS.includes(val), { message: "Invalid pricing option selected." }),
  name: z.string().min(1, { message: "Name is required for the order." }).max(100),
  email: z.string().email({ message: "A valid email is required for the order." }),
  idempotencyKey: z.string().min(1, { message: "Idempotency key is required." }),
  activationType: z.enum(['pre-activated', 'self-activation']).optional().default('pre-activated'),
  adobeEmail: z.string().email({ message: "A valid Adobe email is required for self-activation." }).optional(),
});
export type CreatePaymentIntentPayload = z.infer<typeof CreatePaymentIntentSchema>;

// --- Profile Preferences Schema ---
export const UpdatePreferencesSchema = z.object({
    marketingConsent: z.boolean().default(false),
});
export type UpdatePreferencesFormData = z.infer<typeof UpdatePreferencesSchema>;

/**
 * This file contains functions to generate structured data schemas for SEO
 */

/**
 * Generate schema.org Table structured data for comparison tables
 * @param caption The table caption
 * @param headers Array of table headers
 * @param rows Array of table rows where each row is an array of cell values
 * @returns Table structured data object
 */
export function generateTableSchema(caption: string, headers: string[], rows: string[][]) {
  return {
    "@context": "https://schema.org",
    "@type": "Table",
    "about": caption,
    "name": caption,
    "description": `Comparison data for ${caption}`,
    "cssSelector": "table",
    "tableLayout": "vertical",
    "columnPosition": headers.map((_, i) => i),
    "rowPosition": rows.map((_, i) => i),
    "columnHeader": headers.map((header) => {
      return {
        "@type": "PropertyValue",
        "name": header
      }
    }),
    "row": rows.map((row, i) => {
      return {
        "@type": "TableRow",
        "rowPosition": i,
        "cellValue": row.map((cell, j) => {
          return {
            "@type": "PropertyValue",
            "name": headers[j],
            "value": cell
          }
        })
      }
    })
  };
}

/**
 * Generate schema.org ComparisonTable structured data
 * @param title The comparison table title
 * @param products Array of product names being compared
 * @param features Object mapping feature names to arrays of ratings (one per product)
 * @returns ComparisonTable structured data object
 */
export function generateComparisonTableSchema(
  title: string, 
  products: string[],
  features: Record<string, {rating: number, description?: string}[]>
) {
  const featureEntries = Object.entries(features);
  
  return {
    "@context": "https://schema.org",
    "@type": "ComparisonTable",
    "name": title,
    "description": `Comparison between ${products.join(' and ')}`,
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "comparedItems": products.map(name => ({
      "@type": "Product",
      "name": name
    })),
    "featuresList": featureEntries.map(([featureName, ratings]) => ({
      "@type": "ComparisonFeature",
      "name": featureName,
      "ratings": ratings.map((rating, i) => ({
        "@type": "Rating",
        "ratingValue": rating.rating,
        "bestRating": 5,
        "worstRating": 0,
        "itemReviewed": {
          "@type": "Product",
          "name": products[i]
        },
        "reviewBody": rating.description || `${featureName} rating for ${products[i]}`
      }))
    }))
  };
}

/**
 * Create schema for a product comparison with pricing and features
 * @param product1 First product info
 * @param product2 Second product info
 * @param comparisonUrl URL of comparison page
 * @returns Structured data for product comparison
 */
export function generateProductComparisonSchema(
  product1: {
    name: string;
    description: string;
    price: string;
    priceCurrency: string;
    image?: string;
    url?: string;
  },
  product2: {
    name: string;
    description: string;
    price: string;
    priceCurrency: string;
    image?: string;
    url?: string;
  },
  comparisonUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${product1.name} vs ${product2.name} Comparison`,
    "description": `A detailed comparison between ${product1.name} and ${product2.name}`,
    "url": comparisonUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.5,
      "reviewCount": 120
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": product1.priceCurrency,
      "offers": [
        {
          "@type": "Offer",
          "name": product1.name,
          "price": product1.price,
          "priceCurrency": product1.priceCurrency,
          "availability": "https://schema.org/InStock",
          "url": product1.url || comparisonUrl,
          "seller": {
            "@type": "Organization",
            "name": "CheapCC"
          }
        },
        {
          "@type": "Offer",
          "name": product2.name,
          "price": product2.price,
          "priceCurrency": product2.priceCurrency,
          "availability": "https://schema.org/InStock",
          "url": product2.url || comparisonUrl,
          "seller": {
            "@type": "Organization",
            "name": "CheapCC"
          }
        }
      ]
    }
  };
}