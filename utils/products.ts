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
    price: 2.99,
    description: 'Perfect for short-term projects',
  },
  {
    id: '1m',
    name: '1 Month',
    duration: '1 month',
    price: 12.99,
    description: 'Monthly subscription',
  },
  {
    id: '3m',
    name: '3 Months',
    duration: '3 months',
    price: 32.99,
    description: 'Quarterly subscription - Save 15%',
  },
  {
    id: '6m',
    name: '6 Months',
    duration: '6 months',
    price: 59.99,
    description: 'Semi-annual subscription - Save 23%',
  },
  {
    id: '12m',
    name: '12 Months',
    duration: '12 months',
    price: 99.99,
    description: 'Annual subscription - Save 36%',
  },
]; 