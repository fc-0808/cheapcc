import * as React from 'react';

interface CustomerOwnedEmailAnnouncementTemplateProps {
  name: string;
}

export const CustomerOwnedEmailAnnouncementTemplate: React.FC<Readonly<CustomerOwnedEmailAnnouncementTemplateProps>> = ({
  name,
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Feature: Use Your Own Adobe Account with CheapCC</title>
    </head>
    <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'", lineHeight: 1.6, color: '#333333', margin: 0, padding: 0, backgroundColor: '#f4f7f6' }}>
      <div style={{ width: '100%', backgroundColor: '#f4f7f6', padding: '20px 0' }}>
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#2c2d5a', color: '#ffffff', padding: '30px 20px', textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>🎉 New Feature: Customer-Owned Email Activation</h1>
          </div>
          <div style={{ padding: '30px 25px', fontSize: 16, color: '#555555' }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 18 }}>Hi {name},</p>
              <p style={{ marginBottom: 18 }}>We're excited to announce a new feature that gives you even more control over your Adobe Creative Cloud subscription!</p>
              <p style={{ marginBottom: 18 }}>You can now activate Adobe Creative Cloud subscriptions directly on <strong>your existing Adobe account</strong>, preserving all your settings, cloud storage, and preferences.</p>
            </div>

            {/* Feature Highlight Box */}
            <div style={{ background: 'linear-gradient(135deg, #edf7ff 0%, #f0f9ff 100%)', borderLeft: '4px solid #2c2d5a', borderRadius: 8, padding: 20, margin: '30px 0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 600, color: '#1a1b3a' }}>✨ Use Your Email Feature</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: 15, lineHeight: 1.5, color: '#2d3748' }}>
                <strong style={{ color: '#1a1b3a' }}>What's New:</strong> Choose "Use Your Email" during checkout and provide your Adobe account email. We'll add the subscription directly to your existing account.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#2d3748' }}>
                <strong style={{ color: '#1a1b3a' }}>Benefits:</strong> Keep your existing workspace, cloud files, fonts, and all personalized settings intact.
              </p>
            </div>

            {/* How It Works */}
            <div style={{ marginBottom: 25 }}>
              <h3 style={{ color: '#2c2d5a', fontSize: 18, fontWeight: 600, marginBottom: 15 }}>How It Works:</h3>
              <div style={{ paddingLeft: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <span style={{ color: '#2c2d5a', fontSize: 15, fontWeight: 'bold', flexShrink: 0, marginTop: 1, minWidth: 16 }}>1.</span>
                  <p style={{ margin: 0, fontSize: 15 }}>Select "Use Your Email" when choosing your subscription plan</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <span style={{ color: '#2c2d5a', fontSize: 15, fontWeight: 'bold', flexShrink: 0, marginTop: 1, minWidth: 16 }}>2.</span>
                  <p style={{ margin: 0, fontSize: 15 }}>Enter your existing Adobe account email address</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <span style={{ color: '#2c2d5a', fontSize: 15, fontWeight: 'bold', flexShrink: 0, marginTop: 1, minWidth: 16 }}>3.</span>
                  <p style={{ margin: 0, fontSize: 15 }}>Complete your purchase and we'll activate the subscription on your account</p>
                </div>
              </div>
            </div>

            {/* Pricing Note */}
            <div style={{ background: '#fffbe6', borderLeft: '4px solid #ffe066', borderRadius: 6, padding: 16, margin: '24px 0', color: '#b08900', fontSize: 15 }}>
              <strong>Pricing:</strong> Use your email includes a small processing fee to cover the additional setup requirements. Both pre-activated and use your email options are available at checkout.
            </div>

            {/* Call to Action */}
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <a
                href="https://cheapcc.online"
                style={{ backgroundColor: '#ff3366', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: 5, fontWeight: 'bold', display: 'inline-block', fontSize: 16, border: 'none', cursor: 'pointer' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Try Use Your Email Now
              </a>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 18 }}>This new option gives you the flexibility to choose how you want to manage your Adobe Creative Cloud subscription while maintaining the same great savings you've come to expect from CheapCC.</p>
              <p style={{ marginBottom: 18 }}>If you have any questions about this new feature or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@cheapcc.online" style={{ color: '#ff3366' }}>support@cheapcc.online</a>.</p>
              <p style={{ marginBottom: 0 }}>Thank you for being a valued CheapCC customer!</p>
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
