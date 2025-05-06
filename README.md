# PayPal Integration with Next.js

This project demonstrates how to integrate PayPal payments with Next.js, including:

- Creating and capturing orders with the PayPal REST API
- Rendering PayPal buttons with the JavaScript SDK
- Handling webhooks for payment notifications

## Features

- Server-side order creation and capture using PayPal Checkout Server SDK
- Client-side PayPal Smart Button integration
- Webhook handling for payment notifications
- Complete payment flow with success/cancel pages

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

# Base URL for your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

See `ENV_SETUP.md` for more details on how to obtain these credentials.

### 4. Set up a publicly accessible URL

To receive webhooks from PayPal, your application needs to be accessible from the internet. You can use a tool like [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
```

### 5. Configure a webhook in the PayPal Developer Dashboard

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Go to the "Webhooks" section
3. Add a new webhook with your public URL + `/api/webhooks/paypal`
4. Select the event types:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - CHECKOUT.ORDER.APPROVED
5. Copy the Webhook ID and add it to your `.env.local` file

### 6. Start the development server

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000 to see the application.

## Testing the Integration

1. Go to the checkout page
2. Click the PayPal button
3. Complete the payment using a sandbox account
4. You should be redirected to the success page
5. Check your server logs for webhook events

## Important Files

- `app/checkout/page.tsx`: Client-side PayPal button integration
- `app/api/orders/route.ts`: Server endpoint for creating orders
- `app/api/orders/capture/route.ts`: Server endpoint for capturing payments
- `app/api/webhooks/paypal/route.ts`: Webhook handler for PayPal notifications
- `utils/paypal-webhook.ts`: Helper functions for webhook signature verification

## Learn More

- [PayPal JavaScript SDK Documentation](https://developer.paypal.com/sdk/js/reference/)
- [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
- [Next.js Documentation](https://nextjs.org/docs)
