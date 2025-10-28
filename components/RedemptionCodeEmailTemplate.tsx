import * as React from 'react';

interface RedemptionCodeEmailTemplateProps {
  name: string;
  orderId: string;
  isGuest?: boolean;
  productName?: string;
  duration?: string;
  priceDisplay?: string;
}

export const RedemptionCodeEmailTemplate: React.FC<Readonly<RedemptionCodeEmailTemplateProps>> = ({
  name,
  orderId,
  isGuest = false,
  productName = 'Adobe Creative Cloud',
  duration = '6 months',
  priceDisplay,
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your CheapCC Redemption Code Order Confirmation</title>
    </head>
    <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'", lineHeight: 1.6, color: '#333333', margin: 0, padding: 0, backgroundColor: '#f4f7f6' }}>
      <div style={{ width: '100%', backgroundColor: '#f4f7f6', padding: '20px 0' }}>
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#2c2d5a', color: '#ffffff', padding: '30px 20px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Your CheapCC Redemption Code Order is Confirmed!</h1>
          </div>
          <div style={{ padding: '30px 25px', fontSize: 16, color: '#555555' }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 18 }}>Hi {name},</p>
              <p style={{ marginBottom: 18 }}>Thank you for your purchase! Your redemption code order has been received and is now being processed.</p>
              <p style={{ marginBottom: 18 }}>You have purchased a <strong>{productName} - {duration} Redemption Code</strong>. Your redemption code will be sent to you in a separate email within 24 hours.</p>
            </div>
            
            <div style={{ background: '#f4f7f6', borderRadius: 6, padding: 18, margin: '30px 0', fontSize: 15, color: '#2c2d5a', fontWeight: 500 }}>
              <div style={{ marginBottom: 8 }}><strong>Order Number:</strong> <span style={{ color: '#ff3366' }}>{orderId}</span></div>
              <div style={{ marginBottom: 8 }}><strong>Status:</strong> <span style={{ color: '#10b981' }}>Confirmed</span></div>
              <div><strong>Product Type:</strong> <span style={{ color: '#9333ea' }}>Redemption Code</span></div>
            </div>

            {(productName || duration || priceDisplay) && (
              <div style={{ background: '#eef2ff', borderLeft: '4px solid #6366f1', borderRadius: 6, padding: 16, margin: '24px 0', color: '#1e293b', fontSize: 15 }}>
                <strong>Order Summary</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {productName && <li><strong>Product:</strong> {productName}</li>}
                  {duration && <li><strong>Duration:</strong> {duration}</li>}
                  {priceDisplay && <li><strong>Total Paid:</strong> {priceDisplay}</li>}
                </ul>
              </div>
            )}

            {/* Redemption code specific information */}
            <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: 6, padding: 16, margin: '24px 0', color: '#92400e', fontSize: 15 }}>
              <strong>🔑 Redemption Code Delivery:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><strong>Your redemption code will be sent within 24 hours</strong> to this email address</li>
                <li>The code will be in the format: XXXX-XXXX-XXXX-XXXX</li>
                <li>You'll receive detailed instructions on how to redeem your code</li>
                <li>Redeem at <a href="https://redeem.adobe.com" style={{ color: '#ff3366', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">redeem.adobe.com</a> using your Adobe ID</li>
              </ul>
            </div>

            {/* Important notes */}
            <div style={{ background: '#e0f2fe', borderLeft: '4px solid #0ea5e9', borderRadius: 6, padding: 16, margin: '24px 0', color: '#0c4a6e', fontSize: 15 }}>
              <strong>📋 Important Notes:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Keep your redemption code secure and don't share it with others</li>
                <li>You'll need an Adobe ID to redeem the code (create one free at adobe.com if needed)</li>
                <li>The code activates immediately upon redemption</li>
                <li>Your subscription will be tied to the Adobe account used for redemption</li>
              </ul>
            </div>

            {/* Guest reminder */}
            {isGuest && (
              <div style={{ background: '#fffbe6', borderLeft: '4px solid #ffe066', borderRadius: 6, padding: 16, margin: '24px 0', color: '#b08900', fontSize: 15 }}>
                <strong>Guest Checkout:</strong> You checked out as a guest. To view your order details and manage your subscription, <a href="https://cheapcc.online/register" style={{ color: '#ff3366', textDecoration: 'underline', fontWeight: 'bold' }}>register for a free account</a> using this email address.
              </div>
            )}

            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <a
                href={isGuest ? 'https://cheapcc.online/register' : 'https://cheapcc.online/dashboard/orders'}
                style={{ backgroundColor: '#ff3366', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: 5, fontWeight: 'bold', display: 'inline-block', fontSize: 16, border: 'none', cursor: 'pointer' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isGuest ? 'Register to Track Your Order' : 'View Your Orders'}
              </a>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 18 }}>If you have any questions or need help, please visit our <a href="https://cheapcc.online/faq" style={{ color: '#ff3366', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">FAQ page</a> or contact our support team at <a href="mailto:support@cheapcc.online" style={{ color: '#ff3366' }}>support@cheapcc.online</a>.</p>
              <p style={{ marginBottom: 0 }}>Thank you for choosing CheapCC!</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.85em', color: '#888888', padding: '20px 25px', borderTop: '1px solid #eeeeee' }}>
            <p style={{ margin: 0 }}>The CheapCC Team</p>
            <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} CheapCC. All rights reserved.</p>
            <p style={{ margin: 0 }}>
              <a href="https://cheapcc.online" target="_blank" rel="noopener noreferrer" style={{ color: '#ff3366', textDecoration: 'none' }}>Visit CheapCC.Online</a>
            </p>
          </div>
        </div>
      </div>
    </body>
  </html>
);
