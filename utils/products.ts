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
    name: '14-Day Trial',
    duration: '14 days',
    price: 4.99,
    description: '14 days of Adobe Creative Cloud All Apps',
  },
  {
    id: '1m',
    name: '1 Month',
    duration: '1 month',
    price: 14.99,
    description: '1 month of Adobe Creative Cloud All Apps',
  },
  {
    id: '3m',
    name: '3 Months',
    duration: '3 months',
    price: 39.99,
    description: '3 months of Adobe Creative Cloud All Apps',
  },
  {
    id: '6m',
    name: '6 Months',
    duration: '6 months',
    price: 64.99,
    description: '6 months of Adobe Creative Cloud All Apps',
  },
  {
    id: '12m',
    name: '12 Months',
    duration: '12 months',
    price: 124.99,
    description: '12 months of Adobe Creative Cloud All Apps',
  },
];

// Helper to infer plan duration from order
export function getPlanDuration(order: { description?: string; amount?: number | string }): string {
  const description = order.description || '';
  const amount = parseFloat(order.amount as string);
  // Use regex mapping for duration
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
  // Fallback to amount
  if (amount === 4.99) return '14 days';
  if (amount === 14.99) return '1 month';
  if (amount === 39.99) return '3 months';
  if (amount === 64.99) return '6 months';
  if (amount === 124.99) return '12 months';
  return 'Unknown';
} 