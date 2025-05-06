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

#### Option 1: Use the setup script

Run the provided setup script to create a `.env.local` file with default values:

```bash
node setup-env.js
```

This will create a `.env.local` file with a default sandbox client ID ('sb') that works for basic testing. For full functionality, you should update the values with your actual PayPal credentials.

#### Option 2: Manual setup

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

## Troubleshooting

### PayPal Button Not Loading

If you see the message "PayPal button could not be loaded", it could be due to:

1. **Missing PayPal Client ID**: Ensure your `.env.local` file has a valid `PAYPAL_CLIENT_ID` value. At minimum, you can use `sb` for testing.
2. **Ad-blocker or Content Blocker**: Some browser extensions might block the PayPal script. Try disabling them.
3. **Network Issues**: Check your internet connection.

The application provides a fallback button that will still allow you to complete checkout even if the native PayPal button fails to load.

### Testing with Sandbox Client ID

When using the default sandbox client ID ('sb'), you'll have access to basic PayPal functionality. For a complete experience with webhooks and advanced features, replace 'sb' with your actual sandbox client ID from the PayPal Developer Dashboard.

## Important Files

- `app/page.tsx`: Main checkout page with PayPal button integration
- `app/api/orders/route.ts`: Server endpoint for creating orders
- `app/api/orders/capture/route.ts`: Server endpoint for capturing payments
- `app/api/webhooks/paypal/route.ts`: Webhook handler for PayPal notifications
- `utils/paypal-webhook.ts`: Helper functions for webhook signature verification
- `setup-env.js`: Script to set up default environment variables

## Learn More

- [PayPal JavaScript SDK Documentation](https://developer.paypal.com/sdk/js/reference/)
- [PayPal SDK Performance Optimization](https://developer.paypal.com/sdk/js/performance/)
- [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
- [Next.js Documentation](https://nextjs.org/docs)
