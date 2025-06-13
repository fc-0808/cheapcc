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
const VALID_PRICE_IDS = ["14d", "1m", "3m", "6m", "12m", "test-live"]; // Include test-live for payment testing

export const CreateOrderSchema = z.object({
  priceId: z.string().refine(val => VALID_PRICE_IDS.includes(val), { message: "Invalid pricing option selected." }),
  name: z.string().min(1, { message: "Name is required for the order." }).max(100),
  email: z.string().email({ message: "A valid email is required for the order." }),
});
export type CreateOrderPayload = z.infer<typeof CreateOrderSchema>;


// --- PayPal Order Capture Schema (for /api/orders/capture) ---
export const CaptureOrderSchema = z.object({
  orderID: z.string().min(1, { message: "PayPal Order ID is required." }),
});
export type CaptureOrderPayload = z.infer<typeof CaptureOrderSchema>; 