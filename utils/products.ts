export interface PricingOption {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  description: string;
  adminOnly?: boolean;
  activationType?: 'pre-activated' | 'self-activation';
  selfActivationPrice?: number;
}

export const PRODUCT = {
  name: 'Adobe Creative Cloud',
  description: 'Access to Adobe Creative Cloud apps and services',
  image: '/adobe-cc.png', // You'll need to add this image to your public folder
};

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: '1m',
    name: '1 Month',
    duration: '1 month',
    price: 12.99,
    selfActivationPrice: 15.98, // 12.99 + 2.99
    originalPrice: 54.99,
    description: 'Adobe Creative Cloud - 1 Month',
  },
  {
    id: '3m',
    name: '3 Months',
    duration: '3 months',
    price: 29.99,
    selfActivationPrice: 36.98, // 29.99 + 6.99
    originalPrice: 164.97,
    description: 'Adobe Creative Cloud - 3 Months',
  },
  {
    id: '6m',
    name: '6 Months',
    duration: '6 months',
    price: 54.99,
    selfActivationPrice: 67.98, // 54.99 + 12.99
    originalPrice: 329.94,
    description: 'Adobe Creative Cloud - 6 Months',
  },
  {
    id: '12m',
    name: '12 Months',
    duration: '12 months',
    price: 99.99,
    selfActivationPrice: 119.98, // 99.99 + 19.99
    originalPrice: 599.88,
    description: 'Adobe Creative Cloud - 12 Months',
  },
  // Admin-only test option
  {
    id: 'admin-test',
    name: '1 Day',
    duration: '1 day',
    price: 0.5,
    originalPrice: 1.99,
    description: 'Admin Testing - 1 Day',
    adminOnly: true
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
  
  // First try to get the pricing option to use its originalPrice
  if (order.priceId) {
    const option = getPricingOptionById(order.priceId);
    if (option && option.originalPrice) {
      const savings = option.originalPrice - orderAmount;
      return Math.max(0, parseFloat(savings.toFixed(2)));
    }
  }
  
  // Fall back to duration lookup in ADOBE_REGULAR_PRICING
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
    case '1 day': daysToAdd = 1; break;
    case '14 days': daysToAdd = 14; break;
    case '1 month': daysToAdd = 30; break;
    case '3 months': daysToAdd = 90; break;
    case '6 months': daysToAdd = 180; break;
    case '12 months': daysToAdd = 365; break;
    default: return null;
  }
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(createdAt.getDate() + daysToAdd);
  return expiryDate;
}

export function isActiveSubscription(order: OrderLike): boolean {
  const status = order.status?.toUpperCase();
  if (status === 'ACTIVE' || status === 'COMPLETED') {
    // First check if there's a stored expiry_date in the database
    if (order.expiry_date) {
      return new Date(order.expiry_date) > new Date();
    }
    // Fall back to calculated expiry date if no stored date
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

export function getPriceForActivationType(option: PricingOption, activationType: 'pre-activated' | 'self-activation'): number {
  if (activationType === 'self-activation' && option.selfActivationPrice) {
    return option.selfActivationPrice;
  }
  return option.price;
}

export function getSelfActivationFee(duration: string): number {
  const fees: { [key: string]: number } = {
    '1 month': 2.99,
    '3 months': 6.99,
    '6 months': 12.99,
    '12 months': 19.99,
  };
  return fees[duration] || 0;
} 