# PayPal Integration with Next.js

This project demonstrates how to integrate PayPal payments with Next.js, including:

- Creating and capturing orders with the PayPal REST API
- Rendering PayPal buttons with the JavaScript SDK
- Handling webhooks for payment notifications
- Storing completed orders in Supabase with buyer info
- Sending confirmation emails after successful payment

## Features

- Server-side order creation and capture using PayPal Checkout Server SDK
- Client-side PayPal Smart Button integration
- Webhook handling for payment notifications
- **Order data (name, email, amount, currency, etc.) is only stored in Supabase after payment is completed**
- Duplicate insert protection for webhooks
- Confirmation email sent to buyer after successful payment

## Updated Payment Flow

1. **User enters name and email on the frontend.**
2. **Order is created via `/api/orders` endpoint:**
   - The backend encodes the user's name and email as a JSON string in the PayPal order's `custom_id` field.
3. **User completes payment via PayPal.**
4. **PayPal sends a webhook (`PAYMENT.CAPTURE.COMPLETED`) to `/api/webhooks/paypal`:**
   - The webhook handler extracts the name and email from the `custom_id` field.
   - The handler inserts a new order into Supabase with all relevant fields (name, email, amount, currency, etc.), but only if it does not already exist (duplicate protection).
   - A confirmation email is sent to the buyer.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root with the following variables:

```
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SECRET_KEY=your_sandbox_secret_key_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key

# Application Base URL (IMPORTANT for auth redirects)
# For local development, typically http://localhost:3000
# For production, your actual production URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

### 4. Set up a publicly accessible URL

To receive webhooks from PayPal, your application needs to be accessible from the internet. You can use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

### 5. Configure a webhook in the PayPal Developer Dashboard

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Go to the "Webhooks" section
3. Add a new webhook with your public URL + `/api/webhooks/paypal`
4. Select the event type: `PAYMENT.CAPTURE.COMPLETED` (and optionally `PAYMENT.CAPTURE.DENIED`)
5. Copy the Webhook ID and add it to your `.env.local` file

### 6. Start the development server

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000 to see the application.

## How Duplicate Insert Protection Works

- The webhook handler checks if an order with the same PayPal order ID already exists in Supabase before inserting.
- This prevents duplicate records if PayPal retries the webhook.

## How Buyer Info is Passed and Stored

- The frontend collects the buyer's name and email before showing the PayPal button.
- These values are sent to the backend and stored in the PayPal order's `custom_id` field as a JSON string.
- When the webhook is received, the handler parses `custom_id` to retrieve the original name and email for storage in Supabase.

## Testing the Integration

1. Go to the checkout page
2. Enter your name and email
3. Click the PayPal button and complete the payment
4. Wait for the webhook to be received (check your server logs)
5. Confirm the order appears in your Supabase table with all fields populated
6. Check that a confirmation email is sent to the buyer

## Troubleshooting

- **No order in Supabase?**
  - Make sure the webhook is being received and processed (check logs)
  - Ensure your ngrok/public URL is correct and accessible
  - Check that your PayPal webhook is configured for the correct event type
- **No confirmation email?**
  - Make sure your Resend API key and sender domain are set up and verified

## Important Files

- `app/page.tsx`: Main checkout page with PayPal button integration
- `app/api/orders/route.ts`: Server endpoint for creating PayPal orders (encodes buyer info in custom_id)
- `app/api/webhooks/paypal/route.ts`: Webhook handler for PayPal notifications (extracts buyer info, inserts order, sends email)
- `utils/paypal-webhook.ts`: Helper functions for webhook signature verification
- `utils/send-email.ts`: Utility for sending confirmation emails
- `components/EmailTemplate.tsx`: Email template for order confirmation

## Learn More

- [PayPal JavaScript SDK Documentation](https://developer.paypal.com/sdk/js/reference/)
- [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)

# CheapCC - Next.js Application

This is a Next.js application for CheapCC, a service offering Adobe Creative Cloud subscriptions at discounted rates.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_API_MODE=sandbox

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_from_email@example.com

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Payment Integrations

### PayPal Integration

The application uses PayPal for payment processing. To set up PayPal:

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com)
2. Create a new app to get your client ID and secret
3. Add these to your environment variables

### Stripe Integration

The application also supports Stripe for payment processing (including Google Pay). To set up Stripe:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key and secret key from the Stripe Dashboard
3. Set up a webhook endpoint at `/api/webhooks/stripe` in your Stripe Dashboard
4. Get your webhook signing secret
5. Add all these keys to your environment variables

#### Testing Stripe Payments

For testing Stripe payments, you can use the following test card numbers:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

For Google Pay testing, you'll need to:

1. Use Chrome browser
2. Have a test card added to your Google Pay account
3. Be on a device with Google Pay enabled

## Webhook Setup

For local development with webhooks:

1. Install [ngrok](https://ngrok.com/) or a similar tool
2. Run your Next.js app locally
3. Create a tunnel to your local server: `ngrok http 3000`
4. Use the ngrok URL for your webhook endpoints in PayPal and Stripe dashboards

## Database Schema

The application uses Supabase as the database. The main tables are:

- `profiles`: User profiles
- `orders`: Order information including payment details

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [PayPal API Documentation](https://developer.paypal.com/docs/api/overview/)
- [Stripe API Documentation](https://stripe.com/docs/api)

## Performance Optimizations

This project includes several performance optimizations to ensure fast loading times and a smooth user experience:

### JavaScript Optimizations

1. **Code Splitting and Lazy Loading**:
   - Components are dynamically imported using `next/dynamic` and `React.lazy`
   - Heavy components like payment forms are only loaded when needed
   - Below-the-fold content is lazy-loaded based on viewport visibility

2. **Bundle Size Optimization**:
   - Added bundle analyzer for monitoring JavaScript bundle sizes
   - Optimized package imports for heavy libraries (framer-motion, lodash, etc.)
   - Tree-shaking is enabled for production builds

3. **Rendering Optimizations**:
   - Memoization of expensive calculations with `useMemo` and custom `memoize` helper
   - Prevention of unnecessary re-renders with `useCallback` and `React.memo`
   - Optimized intersection observer implementation for viewport detection

4. **Resource Loading**:
   - Payment provider scripts are loaded on-demand
   - Staggered component mounting to avoid layout shifts
   - Idle callbacks for non-critical operations

5. **State Management**:
   - Efficient form validation that doesn't block rendering
   - Properly memoized callbacks to prevent excessive re-renders
   - Optimized event handlers with passive event listeners

### Configuration Optimizations

1. **Next.js Config**:
   - Enabled SWC minification for faster builds
   - Configured modern CSS transform with Lightning CSS
   - Disabled unnecessary headers for better performance
   - Added compression for faster loading times
   - Enabled Partial Prerendering for better page loads

2. **Image Optimization**:
   - Configured efficient image caching
   - Set up appropriate device sizes for responsive images
   - Enabled modern image formats (AVIF, WebP)

To analyze bundle sizes, run:

```bash
npm run analyze
```

This will generate a visual report of your JavaScript bundles to identify opportunities for further optimization.
