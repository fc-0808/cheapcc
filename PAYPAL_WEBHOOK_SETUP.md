# PayPal Webhook Testing Guide

This guide explains how to set up and test PayPal webhooks with your Next.js application.

## What are PayPal Webhooks?

Webhooks allow PayPal to notify your application when events occur, such as when a payment is completed or denied. Instead of constantly polling PayPal's API to check for updates, PayPal will send HTTP POST requests to your specified URL when these events happen.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of your application with your PayPal credentials:

```
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SECRET_KEY=your_sandbox_secret_key_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

### 2. Expose Your Webhook Endpoint

Your webhook endpoint needs to be publicly accessible for PayPal to reach it. For testing, use a tool like [ngrok](https://ngrok.com/) to create a secure tunnel to your localhost:

```bash
# Start your Next.js application
npm run dev

# In a separate terminal, run ngrok to expose port 3000
ngrok http 3000
```

This will give you a public URL like `https://your-ngrok-subdomain.ngrok-free.app` that forwards traffic to your local server.

### 3. Configure the Webhook in PayPal Dashboard

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to your application
3. Go to the "Webhooks" section
4. Click "Add Webhook"
5. Enter your webhook URL: `https://your-ngrok-subdomain.ngrok-free.app/api/webhooks/paypal`
6. Select the events you want to receive notifications for (at minimum `PAYMENT.CAPTURE.COMPLETED`)
7. Save your webhook configuration
8. Copy the webhook ID and add it to your `.env.local` file

## Testing Procedure

1. Make sure your Next.js application is running (`npm run dev`)
2. Ensure ngrok is running and forwarding requests to your application
3. Open your application in a browser and navigate to the checkout page
4. Make a test purchase using the PayPal sandbox
5. Watch your server console logs for webhook notifications
6. You can also check the PayPal Developer Dashboard under Webhooks > Events to see delivery attempts

## Troubleshooting

If you're not receiving webhook notifications:

1. **Check webhook registration**: Verify your webhook is properly registered in the PayPal Developer Dashboard
2. **Verify public URL**: Make sure your ngrok URL is correct and accessible
3. **Check server logs**: Look for any errors in your Next.js server logs
4. **Inspect PayPal dashboard**: Check the Webhook Events section in the PayPal dashboard for delivery attempts and failures
5. **Verify credentials**: Ensure your environment variables are correct

## Common Webhook Events

- `PAYMENT.CAPTURE.COMPLETED`: A payment capture was completed successfully
- `PAYMENT.CAPTURE.DENIED`: A payment capture was denied
- `CHECKOUT.ORDER.APPROVED`: A PayPal checkout order was approved

## Simplified Structure

This project has been simplified to focus only on webhook testing:

- `/app/page.tsx`: Simple landing page with link to checkout
- `/app/checkout/page.tsx`: Basic checkout page with PayPal button
- `/app/api/webhooks/paypal/route.ts`: Webhook handler
- `/utils/paypal-webhook.ts`: Utilities for webhook verification
