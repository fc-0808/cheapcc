import React from 'react';

interface PriceReductionAnnouncementTemplateProps {
  name: string;
}

export function PriceReductionAnnouncementTemplate({ name }: PriceReductionAnnouncementTemplateProps) {
  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.6,
      color: '#333333',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#ff3366', 
        padding: '32px 24px',
        textAlign: 'center' as const
      }}>
        <h1 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: 28, 
          fontWeight: 'bold' 
        }}>
          🎉 We Appreciate You!
        </h1>
        <p style={{ 
          color: 'white', 
          margin: '8px 0 0 0', 
          fontSize: 16,
          opacity: 0.9
        }}>
          Thank you for being a valued CheapCC subscriber
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 24px' }}>
        {/* Greeting */}
        <p style={{ fontSize: 16, marginBottom: 24 }}>
          Hi {name},
        </p>

        {/* Appreciation Message */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 24,
          borderLeft: '4px solid #ff3366'
        }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: '#ff3366' }}>
            Thank You for Your Continued Trust! 💙
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: 15 }}>
            We truly appreciate your subscription with CheapCC. Your support allows us to continue providing affordable Adobe Creative Cloud access to creators worldwide.
          </p>
        </div>

        {/* Great News Section */}
        <h2 style={{ 
          color: '#ff3366', 
          fontSize: 22, 
          fontWeight: 'bold', 
          marginBottom: 16,
          marginTop: 32
        }}>
          🎁 Great News: We've Reduced Our Prices!
        </h2>

        <p style={{ fontSize: 15, marginBottom: 20 }}>
          As a token of our appreciation and to make Adobe Creative Cloud even more accessible, we've <strong>lowered our prices across all subscription plans</strong>. You're now getting even better value for your creative needs!
        </p>

        {/* New Pricing Table */}
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '2px solid #ff3366',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 24
        }}>
          <div style={{ 
            backgroundColor: '#ff3366', 
            color: 'white', 
            padding: '16px 20px',
            textAlign: 'center' as const
          }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>
              💰 New Lower Prices - Adobe Creative Cloud
            </h3>
          </div>
          
          <div style={{ padding: '20px' }}>
            {/* 1 Month Plan */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>1 Month Plan</div>
                <div style={{ fontSize: 13, color: '#666' }}>Pre-activated account</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff3366' }}>$12.99</div>
                <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>was $15.99</div>
              </div>
            </div>

            {/* 3 Month Plan */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>3 Months Plan</div>
                <div style={{ fontSize: 13, color: '#666' }}>Pre-activated account</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff3366' }}>$29.99</div>
                <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>was $39.99</div>
              </div>
            </div>

            {/* 6 Month Plan */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>6 Months Plan</div>
                <div style={{ fontSize: 13, color: '#666' }}>Pre-activated account</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff3366' }}>$54.99</div>
                <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>was $69.99</div>
              </div>
            </div>

            {/* 12 Month Plan */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>12 Months Plan</div>
                <div style={{ fontSize: 13, color: '#666' }}>Pre-activated account</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ff3366' }}>$99.99</div>
                <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>was $129.99</div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Own Email Option */}
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 24,
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: '#0369a1' 
          }}>
            ✨ Use Your Own Email Feature
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#0369a1' }}>
            Don't forget about our "Use Your Own Email" option! Add just <strong>$2.99-$19.99</strong> to any plan above to activate Adobe Creative Cloud directly on your existing Adobe account.
          </p>
        </div>

        {/* Savings Highlight */}
        <div style={{ 
          textAlign: 'center' as const,
          backgroundColor: '#fff7ed',
          padding: 20,
          borderRadius: 8,
          marginBottom: 24,
          border: '1px solid #fb923c'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#ea580c' 
          }}>
            💸 You're Saving Up to 83% vs Adobe's Regular Pricing!
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#9a3412' }}>
            Adobe's regular 12-month plan costs $599.88 - you pay only $99.99 with CheapCC
          </p>
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: 'center' as const, marginBottom: 24 }}>
          <a 
            href="https://cheapcc.online"
            style={{
              display: 'inline-block',
              backgroundColor: '#ff3366',
              color: 'white',
              padding: '16px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: 16,
              marginBottom: 12
            }}
          >
            Upgrade or Renew Now
          </a>
          <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
            Take advantage of our new lower prices today!
          </p>
        </div>

        {/* Thank You Message */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: 20, 
          borderRadius: 8, 
          textAlign: 'center' as const
        }}>
          <p style={{ margin: 0, fontSize: 15, fontStyle: 'italic' }}>
            Thank you for choosing CheapCC and being part of our creative community. We're committed to making professional creative tools accessible to everyone.
          </p>
          <p style={{ margin: '12px 0 0 0', fontSize: 14, fontWeight: 'bold', color: '#ff3366' }}>
            Happy Creating! 🎨
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '24px', 
        textAlign: 'center' as const,
        borderTop: '1px solid #e9ecef'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 'bold', color: '#ff3366' }}>
          CheapCC - Affordable Adobe Creative Cloud
        </p>
        <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#666' }}>
          Making creativity accessible to everyone, everywhere.
        </p>
        
        <div style={{ fontSize: 12, color: '#999' }}>
          <p style={{ margin: '0 0 4px 0' }}>
            Questions? Contact us at{' '}
            <a href="mailto:support@cheapcc.online" style={{ color: '#ff3366', textDecoration: 'none' }}>
              support@cheapcc.online
            </a>
          </p>
          <p style={{ margin: 0 }}>
            Visit us at{' '}
            <a href="https://cheapcc.online" style={{ color: '#ff3366', textDecoration: 'none' }}>
              cheapcc.online
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
