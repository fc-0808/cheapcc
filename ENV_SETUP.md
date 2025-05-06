# Environment Setup for PayPal Webhook Testing

To properly test PayPal webhooks, you need to set up your environment variables. Create a `.env.local` file in the root of your project with the following variables:

```
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SECRET_KEY=your_sandbox_secret_key_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here

# Base URL for your application (for webhook configuration)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Note: The `PAYPAL_CLIENT_ID` is automatically exposed to the frontend by the Next.js configuration.

## How to Get PayPal Credentials

1. **Client ID and Secret Key**:

   - Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Navigate to "My Apps & Credentials"
   - Under "Sandbox", either create a new app or select an existing one
   - Copy the Client ID and Secret

2. **Webhook ID**:
   - After creating your webhook in the PayPal Developer Dashboard
   - Go to the Webhooks section
   - Select your webhook
   - Copy the Webhook ID

## Setting up a Webhook in PayPal Dashboard

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Navigate to "Webhooks" under the "Sandbox" section
3. Click "Add Webhook"
4. Enter your webhook URL (e.g., `https://your-domain.com/api/webhooks/paypal`)
5. Select the event types you want to receive:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `CHECKOUT.ORDER.APPROVED`
6. Save your webhook configuration
7. Copy the Webhook ID for your environment variables

## Project Structure

This is a simplified project focused solely on testing PayPal webhooks. The main components are:

- **Checkout Page**: Handles the entire payment flow including success/failure states in a single page
- **API Routes**:
  - `/api/orders`: Creates PayPal orders
  - `/api/orders/capture`: Captures approved payments
  - `/api/webhooks/paypal`: Receives and processes webhook events

## Important Notes

- Use Sandbox credentials for testing
- Never commit your `.env.local` file to version control
- Make sure your webhook URL is publicly accessible (e.g., using ngrok)
- For local testing, use a tool like ngrok to expose your local server

## Testing Webhook Notifications

After setting up your environment variables:

1. Run your Next.js app: `npm run dev`
2. In a separate terminal, start ngrok: `ngrok http 3000`
3. Update your webhook URL in the PayPal Developer Dashboard with your ngrok URL (e.g., `https://your-ngrok-domain.ngrok.io/api/webhooks/paypal`)
4. Make a test purchase from your app
5. Check your server logs for webhook notifications
