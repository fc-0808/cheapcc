import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  orderId: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  orderId,
}) => (
  <div>
    <h1>Thank you for your purchase, {name}!</h1>
    <p>Your order <strong>{orderId}</strong> has been received and is being processed.</p>
    <p>If you have any questions, reply to this email or contact support@cheapcc.online.</p>
  </div>
); 