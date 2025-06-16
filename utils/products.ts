export interface PricingOption {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
}

export const PRODUCT = {
  name: 'Adobe Creative Cloud',
  description: 'Access to Adobe Creative Cloud apps and services',
  image: '/adobe-cc.png', // You'll need to add this image to your public folder
};

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: '14d',
    name: '14 Days',
    duration: '14 days',
    price: 4.99,
    description: 'Adobe Creative Cloud - 14 Days',
  },
  {
    id: '1m',
    name: '1 Month',
    duration: '1 month',
    price: 14.99,
    description: 'Adobe Creative Cloud - 1 Month',
  },
  {
    id: '3m',
    name: '3 Months',
    duration: '3 months',
    price: 39.99,
    description: 'Adobe Creative Cloud - 3 Months',
  },
  {
    id: '6m',
    name: '6 Months',
    duration: '6 months',
    price: 74.99,
    description: 'Adobe Creative Cloud - 6 Months',
  },
  {
    id: '12m',
    name: '12 Months',
    duration: '12 months',
    price: 124.99,
    description: 'Adobe Creative Cloud - 12 Months',
  },
  // Admin-only test payment option
  {
    id: 'test-payment',
    name: 'Test Payment',
    duration: 'Test',
    price: 0.01,
    description: 'Adobe Creative Cloud - Test Payment',
  },
];

export interface OrderLike {
  description?: string | null;
  amount?: number | string | null;
  created_at?: string | Date | null;
  status?: string | null;
  expiry_date?: string | Date | null;
  priceId?: string | null;
}

export const ADOBE_REGULAR_PRICING: { [key: string]: number } = {
  '14 days': 23.99,
  '1 month': 54.99,
  '3 months': 164.97,
  '6 months': 329.94,
  '12 months': 599.88,
};

export function getPricingOptionById(priceId: string | null | undefined): PricingOption | undefined {
  if (!priceId) return undefined;
  return PRICING_OPTIONS.find(option => option.id === priceId);
}

export function getPlanDuration(order: OrderLike): string {
  if (order.priceId) {
    const option = getPricingOptionById(order.priceId);
    if (option) return option.duration;
  }
  const description = order.description || '';
  const amount = order.amount ? parseFloat(order.amount.toString()) : undefined;
  for (const option of PRICING_OPTIONS) {
    if (description.includes(option.duration) || description.includes(option.name)) {
      return option.duration;
    }
    if (amount === option.price) {
      return option.duration;
    }
  }
  const durationMap: { [key: string]: RegExp } = {
    '14 days': /14\s*-?\s*days?/i,
    '1 month': /1\s*-?\s*month|30\s*-?\s*days?/i,
    '3 months': /3\s*-?\s*months?|90\s*-?\s*days?/i,
    '6 months': /6\s*-?\s*months?|180\s*-?\s*days?/i,
    '12 months': /12\s*-?\s*months?|1\s*-?\s*year|365\s*-?\s*days?/i,
  };
  for (const [label, regex] of Object.entries(durationMap)) {
    if (regex.test(description)) return label;
  }
  if (amount === 4.99) return '14 days';
  if (amount === 14.99) return '1 month';
  if (amount === 39.99) return '3 months';
  if (amount === 64.99) return '6 months';
  if (amount === 124.99) return '12 months';
  return 'Unknown';
}

export function getStandardPlanDescription(order: OrderLike): string {
  const duration = getPlanDuration(order);
  if (duration && duration !== 'Unknown') {
    const pricingOption = PRICING_OPTIONS.find(p => p.duration === duration);
    if (pricingOption) return pricingOption.description;
    return `${PRODUCT.name} - ${duration} Subscription`;
  }
  const amount = order.amount ? parseFloat(order.amount.toString()) : undefined;
  const matchedOption = PRICING_OPTIONS.find(opt => opt.price === amount);
  if (matchedOption) return matchedOption.description;
  return order.description || `${PRODUCT.name} Subscription (Unknown Duration)`;
}

export function calculateSavings(order: OrderLike): number {
  const orderAmount = order.amount ? parseFloat(order.amount.toString()) : null;
  if (orderAmount === null || isNaN(orderAmount)) return 0;
  const duration = getPlanDuration(order);
  const regularPrice = ADOBE_REGULAR_PRICING[duration];
  if (regularPrice) {
    const savings = regularPrice - orderAmount;
    return Math.max(0, parseFloat(savings.toFixed(2)));
  }
  return 0;
}

export function calculateExpiryDate(order: OrderLike): Date | null {
  if (!order.created_at) return null;
  const createdAt = new Date(order.created_at);
  const durationStr = getPlanDuration(order);
  let daysToAdd = 0;
  switch (durationStr) {
    case '14 days': daysToAdd = 14; break;
    case '1 month': daysToAdd = 30; break;
    case '3 months': daysToAdd = 90; break;
    case '6 months': daysToAdd = 180; break;
    case '12 months': daysToAdd = 365; break;
    case 'Test': daysToAdd = 1; break; // Test payment expires after 1 day
    default: return null;
  }
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(createdAt.getDate() + daysToAdd);
  return expiryDate;
}

export function isActiveSubscription(order: OrderLike): boolean {
  const status = order.status?.toUpperCase();
  if (status === 'ACTIVE' || status === 'COMPLETED') {
    if (order.expiry_date) {
      return new Date(order.expiry_date) > new Date();
    }
    const calculatedExpiry = calculateExpiryDate(order);
    if (calculatedExpiry) {
      return calculatedExpiry > new Date();
    }
    return true;
  }
  return false;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return `$${parseFloat(amount.toString()).toFixed(2)}`;
} 