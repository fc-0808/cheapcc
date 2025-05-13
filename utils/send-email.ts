import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(to: string, name: string, orderId: string) {
  return resend.emails.send({
    from: 'CheapCC Support <support@cheapcc.online>',
    to,
    subject: 'Your CheapCC Order Confirmation',
    react: React.createElement(EmailTemplate, { name, orderId }),
  });
} 