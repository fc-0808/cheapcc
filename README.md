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
