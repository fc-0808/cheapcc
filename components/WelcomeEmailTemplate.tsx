import React from 'react';

interface WelcomeEmailTemplateProps {
  name: string;
}

export const WelcomeEmailTemplate: React.FC<Readonly<WelcomeEmailTemplateProps>> = ({
  name,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to CheapCC</title>
    </head>
    <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f4f4', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#2c2d5a', textAlign: 'center', padding: '20px 0', borderBottom: '4px solid #ff3366' }}>
            <h1 style={{ color: '#ffffff', margin: 0, fontSize: 28, fontWeight: 700 }}>
              <span style={{ color: '#ffffff' }}>Cheap</span>
              <span style={{ color: '#ff3366' }}>CC</span>
            </h1>
          </div>
          <div style={{ padding: '30px 25px' }}>
            <h2 style={{ color: '#2c2d5a', marginTop: 0, fontSize: 24, fontWeight: 600 }}>
              Welcome to CheapCC, {name}!
            </h2>
            <p style={{ color: '#4a4a4a', lineHeight: 1.6, fontSize: 16 }}>
              Thank you for creating your account. You now have access to exclusive Adobe Creative Cloud subscription offers at unbeatable prices.
            </p>
            <div style={{ background: '#edf7ff', borderLeft: '4px solid #2c2d5a', borderRadius: 6, padding: 16, margin: '24px 0', color: '#2c2d5a', fontSize: 15 }}>
              <strong>Your account is ready to use.</strong> You can now browse plans, make purchases, and manage your subscriptions.
            </div>
            <div style={{ textAlign: 'center', margin: '30px 0' }}>
              <a
                href="https://cheapcc.online/dashboard"
                style={{ backgroundColor: '#ff3366', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: 5, fontWeight: 'bold', display: 'inline-block', fontSize: 16, border: 'none', cursor: 'pointer' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Browse Subscription Plans
              </a>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 18 }}>If you have any questions or need help, please visit our <a href="https://cheapcc.online" style={{ color: '#ff3366', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">Help Center</a> or contact our support team at <a href="mailto:support@cheapcc.online" style={{ color: '#ff3366' }}>support@cheapcc.online</a>.</p>
              <p style={{ marginBottom: 0 }}>We're excited to have you as a customer!</p>
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