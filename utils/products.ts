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