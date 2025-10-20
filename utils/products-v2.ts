// Enhanced product management system for redemption codes and subscriptions
export type ProductType = 'subscription' | 'redemption_code';
export type AdobeProductLine = 'creative_cloud' | 'acrobat_pro';
export type ActivationType = 'pre-activated' | 'email-activation';

export interface Product {
  id: string;
  product_type: ProductType;
  adobe_product_line: AdobeProductLine;
  name: string;
  description: string;
  duration_months: number;
  base_price: number;
  original_price?: number;
  is_active: boolean;
  admin_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface RedemptionCodeRecord {
  id: string;
  product_id: string;
  order_id?: string;
  status: 'pending' | 'purchased' | 'delivered' | 'redeemed';
  quantity: number;
  customer_name: string;
  customer_email: string;
  delivered_at?: string;
  delivery_method: 'email' | 'manual';
  delivery_notes?: string;
  redeemed_at?: string;
  redemption_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedOrder {
  id: string;
  product_id?: string;
  product_type: ProductType;
  redemption_code_id?: string;
  name: string;
  email: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  activation_type: ActivationType;
  adobe_email?: string;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
  
  // Relations
  product?: Product;
  redemption_code_record?: RedemptionCodeRecord;
}

// Redemption code product catalog
export const REDEMPTION_PRODUCTS: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
  // Adobe Creative Cloud Redemption Codes
  {
    product_type: 'redemption_code',
    adobe_product_line: 'creative_cloud',
    name: 'Adobe Creative Cloud - 1 Month Code',
    description: 'Adobe Creative Cloud 1-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 1,
    base_price: 39.99, // Updated to match database
    original_price: 54.99,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'creative_cloud',
    name: 'Adobe Creative Cloud - 3 Months Code',
    description: 'Adobe Creative Cloud 3-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 3,
    base_price: 89.99, // Updated to match database
    original_price: 164.97,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'creative_cloud',
    name: 'Adobe Creative Cloud - 6 Months Code',
    description: 'Adobe Creative Cloud 6-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 6,
    base_price: 159.99, // Updated to match database
    original_price: 329.94,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'creative_cloud',
    name: 'Adobe Creative Cloud - 12 Months Code',
    description: 'Adobe Creative Cloud 12-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 12,
    base_price: 249.99, // Already matches database
    original_price: 659.88,
    is_active: true,
    admin_only: false,
  },
  
  // Adobe Acrobat Pro Redemption Codes
  {
    product_type: 'redemption_code',
    adobe_product_line: 'acrobat_pro',
    name: 'Adobe Acrobat Pro - 1 Month Code',
    description: 'Adobe Acrobat Pro 1-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 1,
    base_price: 9.99, // Updated to match database
    original_price: 22.99,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'acrobat_pro',
    name: 'Adobe Acrobat Pro - 3 Months Code',
    description: 'Adobe Acrobat Pro 3-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 3,
    base_price: 27.99, // Updated to match database
    original_price: 68.97,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'acrobat_pro',
    name: 'Adobe Acrobat Pro - 6 Months Code',
    description: 'Adobe Acrobat Pro 6-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 6,
    base_price: 49.99, // Already matches database
    original_price: 137.94,
    is_active: true,
    admin_only: false,
  },
  {
    product_type: 'redemption_code',
    adobe_product_line: 'acrobat_pro',
    name: 'Adobe Acrobat Pro - 12 Months Code',
    description: 'Adobe Acrobat Pro 12-Month Redemption Code - Redeem at redeem.adobe.com',
    duration_months: 12,
    base_price: 89.99, // Updated to match database
    original_price: 275.88,
    is_active: true,
    admin_only: false,
  },
];

// Legacy compatibility - convert old pricing options to new format
export interface LegacyPricingOption {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  description: string;
  adminOnly?: boolean;
  activationType?: ActivationType;
}

// Convert new products to legacy format for backward compatibility
export function convertProductToLegacyOption(product: Product): LegacyPricingOption {
  return {
    id: `${product.product_type}-${product.adobe_product_line}-${product.duration_months}m`,
    name: `${product.duration_months} Month${product.duration_months > 1 ? 's' : ''}`,
    duration: `${product.duration_months} month${product.duration_months > 1 ? 's' : ''}`,
    price: product.base_price,
    originalPrice: product.original_price,
    description: product.description,
    adminOnly: product.admin_only,
  };
}

// Product utility functions
export function getProductsByType(products: Product[], type: ProductType): Product[] {
  return products.filter(p => p.product_type === type && p.is_active);
}

export function getProductsByLine(products: Product[], line: AdobeProductLine): Product[] {
  return products.filter(p => p.adobe_product_line === line && p.is_active);
}

export function getRedemptionProducts(products: Product[]): Product[] {
  return getProductsByType(products, 'redemption_code');
}

export function getSubscriptionProducts(products: Product[]): Product[] {
  return getProductsByType(products, 'subscription');
}

export function calculateProductPrice(product: Product, activationType: ActivationType = 'pre-activated'): number {
  if (product.product_type === 'redemption_code') {
    // Redemption codes don't have activation types - they're always the base price
    return product.base_price;
  }
  
  // Self-activation no longer has additional fees
  // All products use base_price regardless of activation type
  
  return product.base_price;
}

export function calculateSavingsPercentage(product: Product): number {
  if (!product.original_price) return 0;
  return Math.round((1 - product.base_price / product.original_price) * 100);
}

export function formatProductDuration(months: number): string {
  if (months === 1) return '1 Month';
  if (months < 12) return `${months} Months`;
  if (months === 12) return '1 Year';
  return `${Math.floor(months / 12)} Year${Math.floor(months / 12) > 1 ? 's' : ''}`;
}

// Redemption code utilities (for validation and instructions only - codes not stored)
export function validateRedemptionCodeFormat(code: string): boolean {
  // Adobe redemption code format: XXXX-XXXX-XXXX-XXXX
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(code);
}

export function getRedemptionInstructions(product: Product): string {
  const baseUrl = 'https://redeem.adobe.com';
  
  if (product.adobe_product_line === 'creative_cloud') {
    return `Visit ${baseUrl} and enter your redemption code to activate your Adobe Creative Cloud subscription. You'll need an Adobe ID to redeem.`;
  }
  
  if (product.adobe_product_line === 'acrobat_pro') {
    return `Visit ${baseUrl} and enter your redemption code to activate your Adobe Acrobat Pro subscription. You'll need an Adobe ID to redeem.`;
  }
  
  return `Visit ${baseUrl} and enter your redemption code to activate your Adobe subscription.`;
}

// Product categorization for UI
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  products: Product[];
}

export function categorizeProducts(products: Product[]): ProductCategory[] {
  const activeProducts = products.filter(p => p.is_active);
  
  return [
    {
      id: 'creative-cloud-codes',
      name: 'Creative Cloud Codes',
      description: 'Redemption codes for Adobe Creative Cloud',
      icon: 'fas fa-palette',
      products: activeProducts.filter(p => 
        p.product_type === 'redemption_code' && 
        p.adobe_product_line === 'creative_cloud'
      ),
    },
    {
      id: 'acrobat-pro-codes',
      name: 'Acrobat Pro Codes',
      description: 'Redemption codes for Adobe Acrobat Pro',
      icon: 'fas fa-file-pdf',
      products: activeProducts.filter(p => 
        p.product_type === 'redemption_code' && 
        p.adobe_product_line === 'acrobat_pro'
      ),
    },
    {
      id: 'creative-cloud-subscriptions',
      name: 'Creative Cloud Subscriptions',
      description: 'Direct Adobe Creative Cloud subscriptions',
      icon: 'fas fa-cloud',
      products: activeProducts.filter(p => 
        p.product_type === 'subscription' && 
        p.adobe_product_line === 'creative_cloud'
      ),
    },
  ];
}

export default {
  REDEMPTION_PRODUCTS,
  convertProductToLegacyOption,
  getProductsByType,
  getProductsByLine,
  getRedemptionProducts,
  getSubscriptionProducts,
  calculateProductPrice,
  calculateSavingsPercentage,
  formatProductDuration,
  validateRedemptionCodeFormat,
  getRedemptionInstructions,
  categorizeProducts,
};
