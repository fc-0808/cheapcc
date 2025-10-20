// utils/products.ts
// Simple, working pricing system

export interface PricingOption {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  description: string;
  activationType: 'pre-activated' | 'email-activation' | 'redemption-required';
  productType: 'subscription' | 'redemption_code';
  adobeProductLine: 'creative_cloud' | 'acrobat_pro';
  productId: string;
  durationMonths: number;
}

// Simple hardcoded pricing options - no API calls, no complexity
export const PRICING_OPTIONS: PricingOption[] = [
  // Pre-activated subscriptions
  {
    id: '1m',
    name: '1 Month',
    duration: '1 month',
    price: 12.99,
    originalPrice: 54.99,
    description: 'Adobe Creative Cloud - 1 Month Subscription with Account Credentials',
    activationType: 'pre-activated',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: '347bbb04-3f39-4a49-8ab6-cc2518673c65',
    durationMonths: 1
  },
  {
    id: '3m',
    name: '3 Months',
    duration: '3 months',
    price: 29.99,
    originalPrice: 164.97,
    description: 'Adobe Creative Cloud - 3 Months Subscription with Account Credentials',
    activationType: 'pre-activated',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: '101ec822-4d33-4504-b932-568b82c48f25',
    durationMonths: 3
  },
  {
    id: '6m',
    name: '6 Months',
    duration: '6 months',
    price: 54.99,
    originalPrice: 329.94,
    description: 'Adobe Creative Cloud - 6 Months Subscription with Account Credentials',
    activationType: 'pre-activated',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: 'ce3c3c59-499a-44e1-851e-98edfe95944e',
    durationMonths: 6
  },
  {
    id: '12m',
    name: '12 Months',
    duration: '12 months',
    price: 99.99,
    originalPrice: 599.88,
    description: 'Adobe Creative Cloud - 12 Months Subscription with Account Credentials',
    activationType: 'pre-activated',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: '21056281-4310-4a4a-bea0-0b7bcea420f0',
    durationMonths: 12
  },
  // Email-activation subscriptions
  {
    id: '1m-self',
    name: '1 Month (Email-Activation)',
    duration: '1 month',
    price: 15.98,
    originalPrice: 54.99,
    description: 'Adobe Creative Cloud - 1 Month Email-Activation Subscription',
    activationType: 'email-activation',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: '0850d34b-630a-4c6e-ab2f-c3b0b2ffb940',
    durationMonths: 1
  },
  {
    id: '3m-self',
    name: '3 Months (Email-Activation)',
    duration: '3 months',
    price: 35.98,
    originalPrice: 164.97,
    description: 'Adobe Creative Cloud - 3 Months Email-Activation Subscription',
    activationType: 'email-activation',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: 'edffec5c-d6b5-4bf6-8f05-304bef3ca26f',
    durationMonths: 3
  },
  {
    id: '6m-self',
    name: '6 Months (Email-Activation)',
    duration: '6 months',
    price: 65.98,
    originalPrice: 329.94,
    description: 'Adobe Creative Cloud - 6 Months Email-Activation Subscription',
    activationType: 'email-activation',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: '51d85540-844e-44a0-b7c2-a3746165e525',
    durationMonths: 6
  },
  {
    id: '12m-self',
    name: '12 Months (Email-Activation)',
    duration: '12 months',
    price: 119.98,
    originalPrice: 599.88,
    description: 'Adobe Creative Cloud - 12 Months Email-Activation Subscription',
    activationType: 'email-activation',
    productType: 'subscription',
    adobeProductLine: 'creative_cloud',
    productId: 'b2f439b5-e679-4348-9eef-4d03fdd9e32b',
    durationMonths: 12
  },
  // Redemption codes
  {
    id: 'cc-code-1m',
    name: '1 Month Code',
    duration: '1 month',
    price: 39.99,
    originalPrice: 54.99,
    description: 'Adobe Creative Cloud 1-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'creative_cloud',
    productId: 'c1cfed9d-565d-49d2-a740-b40300a01c99',
    durationMonths: 1
  },
  {
    id: 'cc-code-3m',
    name: '3 Months Code',
    duration: '3 months',
    price: 89.99,
    originalPrice: 164.97,
    description: 'Adobe Creative Cloud 3-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'creative_cloud',
    productId: '2d762c8b-6d0e-4e8e-9f8c-7b2979736030',
    durationMonths: 3
  },
  {
    id: 'cc-code-6m',
    name: '6 Months Code',
    duration: '6 months',
    price: 159.99,
    originalPrice: 329.94,
    description: 'Adobe Creative Cloud 6-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'creative_cloud',
    productId: 'd54971fe-f8c8-485d-a905-fa74b550d6b1',
    durationMonths: 6
  },
  {
    id: 'cc-code-12m',
    name: '12 Months Code',
    duration: '12 months',
    price: 249.99,
    originalPrice: 659.88,
    description: 'Adobe Creative Cloud 12-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'creative_cloud',
    productId: '7ea7daad-d68f-4d99-879f-9b1500005b93',
    durationMonths: 12
  },
  {
    id: 'acrobat-code-1m',
    name: '1 Month Code',
    duration: '1 month',
    price: 9.99,
    originalPrice: 22.99,
    description: 'Adobe Acrobat Pro 1-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'acrobat_pro',
    productId: '7b0d0979-8ecc-4c7d-b488-eea4c7e8d9bb',
    durationMonths: 1
  },
  {
    id: 'acrobat-code-3m',
    name: '3 Months Code',
    duration: '3 months',
    price: 27.99,
    originalPrice: 68.97,
    description: 'Adobe Acrobat Pro 3-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'acrobat_pro',
    productId: '5a44151e-fe50-4379-b540-b8e6dddac078',
    durationMonths: 3
  },
  {
    id: 'acrobat-code-6m',
    name: '6 Months Code',
    duration: '6 months',
    price: 49.99,
    originalPrice: 137.94,
    description: 'Adobe Acrobat Pro 6-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'acrobat_pro',
    productId: '3cac15fe-0539-4015-91e0-a521c2518d72',
    durationMonths: 6
  },
  {
    id: 'acrobat-code-12m',
    name: '12 Months Code',
    duration: '12 months',
    price: 89.99,
    originalPrice: 275.88,
    description: 'Adobe Acrobat Pro 12-Month Redemption Code - Redeem at redeem.adobe.com',
    activationType: 'redemption-required',
    productType: 'redemption_code',
    adobeProductLine: 'acrobat_pro',
    productId: 'a0f98489-9143-4527-a78b-f9eddb02bf97',
    durationMonths: 12
  }
];

// Simple utility functions
export function getPricingOptions(): PricingOption[] {
  return PRICING_OPTIONS;
}

export function getPricingOptionById(id: string): PricingOption | null {
  return PRICING_OPTIONS.find(option => option.id === id) || null;
}

export function getPriceForActivationType(option: PricingOption | null | undefined): number {
  if (!option) return 0;
  return option.price;
}

export function isRedemptionCode(option: PricingOption | null | undefined): boolean {
  if (!option) return false;
  return option.productType === 'redemption_code';
}

export function getProductType(option: PricingOption | null | undefined): string {
  if (!option) return 'creative_cloud';
  return option.productType;
}

export function getAdobeProductLine(option: PricingOption | null | undefined): string {
  if (!option) return 'creative_cloud';
  return option.adobeProductLine;
}

export function isEmailActivationSubscription(option: PricingOption | null | undefined): boolean {
  if (!option) return false;
  return option.productType === 'subscription' && option.activationType === 'email-activation';
}

export function getActivationFee(priceId: string): number {
  const option = getPricingOptionById(priceId);
  if (!option || !isEmailActivationSubscription(option)) return 0;
  
  // Find corresponding pre-activated option
  const preActivatedId = option.id.replace('-self', '');
  const preActivatedOption = getPricingOptionById(preActivatedId);
  
  if (!preActivatedOption) return 0;
  
  return option.price - preActivatedOption.price;
}

export function getPlanDuration(order: any): string {
  // First try to lookup from priceId
  const option = getPricingOptionById(order.priceId);
  if (option) return option.duration;
  
  // Fallback: extract from description field
  if (order.description) {
    if (order.description.includes('12 Months')) return '12 months';
    if (order.description.includes('6 Months')) return '6 months';
    if (order.description.includes('3 Months')) return '3 months';
    if (order.description.includes('1 Month')) return '1 month';
    if (order.description.includes('14 Days')) return '14 days';
    return order.description;
  }
  
  return 'Unknown';
}

export function getStandardPlanDescription(order: any): string {
  const option = getPricingOptionById(order.priceId);
  if (!option) return 'Unknown Plan';
  return option.description;
}

export function calculateSavings(order: any): number {
  // First priority: use database value if available
  if (order.savings) {
    return parseFloat(order.savings) || 0;
  }
  
  // Fallback: calculate from pricing lookup
  const option = getPricingOptionById(order.priceId);
  if (!option || !option.originalPrice) return 0;
  return option.originalPrice - option.price;
}

export function calculateExpiryDate(order: any): string {
  const option = getPricingOptionById(order.priceId);
  if (!option) return 'Unknown';
  
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (option.durationMonths * 30 * 24 * 60 * 60 * 1000));
  return expiryDate.toISOString().split('T')[0];
}

export function isActiveSubscription(order: any): boolean {
  // Check if it's a subscription product type
  if (order.product_type !== 'subscription') return false;
  
  // Check if the order status is active
  if (order.status !== 'ACTIVE') return false;
  
  // Check if the order hasn't expired (if expiry_date exists)
  if (order.expiry_date) {
    const now = new Date();
    const expiryDate = new Date(order.expiry_date);
    if (expiryDate <= now) return false;
  }
  
  return true;
}

export function getRedemptionInstructions(option: PricingOption | null | undefined): string {
  if (!option) return '';
  if (option.productType === 'redemption_code') {
    return 'Redeem at redeem.adobe.com';
  }
  return '';
}

export function getActivationTypeForProduct(option: PricingOption | null | undefined, requestedType?: string): string {
  if (!option) return 'pre-activated';
  
  // For redemption codes, always return redemption-required
  if (option.productType === 'redemption_code') {
    return 'redemption-required';
  }
  
  // For subscriptions, use the option's activation type or the requested type
  return option.activationType || requestedType || 'pre-activated';
}

export function getProductIdFromPriceId(priceId: string): string | null {
  return PRICE_ID_TO_PRODUCT_ID_MAP[priceId] || null;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Price ID to Product ID mapping
export const PRICE_ID_TO_PRODUCT_ID_MAP: Record<string, string> = {
  '1m': '347bbb04-3f39-4a49-8ab6-cc2518673c65',
  '3m': '101ec822-4d33-4504-b932-568b82c48f25', 
  '6m': 'ce3c3c59-499a-44e1-851e-98edfe95944e',
  '12m': '21056281-4310-4a4a-bea0-0b7bcea420f0',
  '1m-self': '0850d34b-630a-4c6e-ab2f-c3b0b2ffb940',
  '3m-self': 'edffec5c-d6b5-4bf6-8f05-304bef3ca26f',
  '6m-self': '51d85540-844e-44a0-b7c2-a3746165e525',
  '12m-self': 'b2f439b5-e679-4348-9eef-4d03fdd9e32b',
  'cc-code-1m': 'c1cfed9d-565d-49d2-a740-b40300a01c99',
  'cc-code-3m': '2d762c8b-6d0e-4e8e-9f8c-7b2979736030',
  'cc-code-6m': 'd54971fe-f8c8-485d-a905-fa74b550d6b1',
  'cc-code-12m': '7ea7daad-d68f-4d99-879f-9b1500005b93',
  'acrobat-code-1m': '7b0d0979-8ecc-4c7d-b488-eea4c7e8d9bb',
  'acrobat-code-3m': '5a44151e-fe50-4379-b540-b8e6dddac078',
  'acrobat-code-6m': '3cac15fe-0539-4015-91e0-a521c2518d72',
  'acrobat-code-12m': 'a0f98489-9143-4527-a78b-f9eddb02bf97'
};