import { CustomerOwnedEmailAnnouncementTemplate } from '@/components/CustomerOwnedEmailAnnouncementTemplate';
import { PriceReductionAnnouncementTemplate } from '@/components/PriceReductionAnnouncementTemplate';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'announcement' | 'marketing' | 'transactional' | 'newsletter' | 'support';
  component: React.ComponentType<any>;
  requiredProps: string[];
  previewProps?: any;
  subject: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateProps {
  name: string;
  email?: string;
  [key: string]: any;
}

// Email template registry
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'customer-owned-email-announcement',
    name: 'Customer-Owned Email Activation Announcement',
    description: 'Announce the new feature that allows customers to use their own Adobe accounts',
    category: 'announcement',
    component: CustomerOwnedEmailAnnouncementTemplate,
    requiredProps: ['name'],
    previewProps: { name: 'John Doe' },
    subject: '🎉 New Feature: Use Your Own Adobe Account with CheapCC',
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'price-reduction-announcement',
    name: 'Price Reduction & Appreciation Announcement',
    description: 'Thank customers for their subscription and announce new lower pricing across all plans',
    category: 'marketing',
    component: PriceReductionAnnouncementTemplate,
    requiredProps: ['name'],
    previewProps: { name: 'Sarah Johnson' },
    subject: '🎉 We Appreciate You! New Lower Prices on All Adobe Creative Cloud Plans',
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
  // Future templates will be added here
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = {
  announcement: {
    name: 'Announcements',
    description: 'Product updates, new features, and company news',
    color: 'bg-blue-100 text-blue-800',
    icon: '📢'
  },
  marketing: {
    name: 'Marketing',
    description: 'Promotional emails, offers, and campaigns',
    color: 'bg-green-100 text-green-800',
    icon: '🎯'
  },
  transactional: {
    name: 'Transactional',
    description: 'Order confirmations, receipts, and account updates',
    color: 'bg-purple-100 text-purple-800',
    icon: '🧾'
  },
  newsletter: {
    name: 'Newsletter',
    description: 'Regular updates and content newsletters',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '📰'
  },
  support: {
    name: 'Support',
    description: 'Help articles, troubleshooting, and customer service',
    color: 'bg-red-100 text-red-800',
    icon: '🆘'
  }
} as const;

// Helper functions
export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.category === category && template.enabled);
}

export function getAllEnabledTemplates(): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.enabled);
}

export function getTemplateCategories() {
  return TEMPLATE_CATEGORIES;
}

// Template validation
export function validateTemplateProps(template: EmailTemplate, props: any): { valid: boolean; missing: string[] } {
  const missing = template.requiredProps.filter(prop => !(prop in props) || props[prop] === undefined || props[prop] === '');
  return {
    valid: missing.length === 0,
    missing
  };
}
