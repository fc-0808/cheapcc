import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

const DEFAULT_RETRY_SECONDS = 60;

// --- Configuration for different limiters ---

// Order Creation Limiter (e.g., 10 requests per minute per IP)
const orderCreationLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60, // seconds
  keyPrefix: 'rlflx_order_create',
});

// Order Capture Limiter (e.g., 15 requests per minute per IP)
const orderCaptureLimiter = new RateLimiterMemory({
  points: 15,
  duration: 60, // seconds
  keyPrefix: 'rlflx_order_capture',
});

// Login Limiter (e.g., 5 attempts per 15 minutes per IP)
const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60, // 15 minutes in seconds
  keyPrefix: 'rlflx_login',
});

// Signup Limiter (e.g., 5 attempts per hour per IP)
const signupLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60, // 1 hour in seconds
  keyPrefix: 'rlflx_signup',
});

// Password Reset Request Limiter (e.g., 3 requests per hour per IP)
const passwordResetRequestLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60, // 1 hour in seconds
  keyPrefix: 'rlflx_pw_reset_request',
});

// Password Update Limiter (e.g., 5 attempts per hour per IP - usually accessed via a token, but IP limit is a fallback)
const passwordUpdateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60, // 1 hour in seconds
  keyPrefix: 'rlflx_pw_update',
});

// Profile Update Limiter (e.g., 10 requests per 5 minutes per IP)
const profileUpdateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 5 * 60, // 5 minutes in seconds
  keyPrefix: 'rlflx_profile_update',
});

// --- Generic Consume Function ---
async function consumeRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ limited: boolean; retryAfter?: number }> {
  try {
    await limiter.consume(key);
    return { limited: false };
  } catch (rlRejected) {
    if (rlRejected instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(rlRejected.msBeforeNext / 1000);
      return { limited: true, retryAfter };
    }
    console.error(JSON.stringify({
        message: "Unexpected rate limit rejection type or scenario.",
        keyUsed: key,
        rejectionDetails: typeof rlRejected === 'object' ? JSON.stringify(rlRejected) : String(rlRejected),
        source: "consumeRateLimit_internal_error"
    }, null, 2));
    return { limited: true, retryAfter: limiter.duration > 0 ? limiter.duration : DEFAULT_RETRY_SECONDS };
  }
}

// Helper function to extract IP address from request
function extractIpAddress(req: NextRequest): string {
  // Check headers in order of preference. These are standard for various platforms.
  // 'x-vercel-forwarded-for' is specific to Vercel and provides the visitor's IP.
  // 'x-forwarded-for' is a standard header for identifying the originating IP address.
  // It can be a comma-separated list, so we take the first one.
  const ip = req.headers.get('x-vercel-forwarded-for') ||
             req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             req.headers.get('cf-connecting-ip') || // Cloudflare
             req.headers.get('x-real-ip'); // Nginx and other proxies

  if (ip) {
      return ip;
  }

  // Fallback for local development or environments where headers are not set.
  return '127.0.0.1';
}

// --- Exported Checker Functions ---

export async function checkRateLimit(
  req: NextRequest,
  limiterInstance: RateLimiterMemory
): Promise<{ limited: boolean; retryAfter?: number }> {
  const ip = extractIpAddress(req);
  return consumeRateLimit(limiterInstance, ip);
}

export async function checkRateLimitByIp(
  ip: string,
  limiterInstance: RateLimiterMemory
): Promise<{ limited: boolean; retryAfter?: number }> {
  // Validate IP to prevent rate limiter key injection
  const sanitizedIp = ip && typeof ip === 'string' ? ip.trim().substring(0, 45) : '127.0.0.1';
  return consumeRateLimit(limiterInstance, sanitizedIp);
}

// --- Specific Limiters ---
export const limiters = {
  orderCreation: orderCreationLimiter,
  orderCapture: orderCaptureLimiter,
  login: loginLimiter,
  signup: signupLimiter,
  passwordResetRequest: passwordResetRequestLimiter,
  passwordUpdate: passwordUpdateLimiter,
  profileUpdate: profileUpdateLimiter,
};